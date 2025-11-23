// 구글 시트 ID와 드라이브 폴더 ID를 여기에 설정하세요
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // 구글 시트 ID
const DRIVE_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID_HERE'; // 구글 드라이브 폴더 ID

// Web App 진입점
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    
    // CORS 헤더 설정
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    let response = {};
    
    switch(action) {
      case 'uploadMedia':
        response = uploadMediaToDrive(params);
        break;
      case 'savePost':
        response = savePostToSheet(params);
        break;
      case 'updatePost':
        response = updatePostInSheet(params);
        break;
      case 'getPosts':
        response = getPostsFromSheet(params);
        break;
      case 'getPost':
        response = getPostById(params);
        break;
      default:
        response = { success: false, message: 'Invalid action' };
    }
    
    output.setContent(JSON.stringify(response));
    return output;
    
  } catch(error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// GET 요청 처리 (CORS preflight)
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: 'ok', message: 'Portfolio Editor API' })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 미디어 파일을 구글 드라이브에 업로드
 */
function uploadMediaToDrive(params) {
  try {
    const fileData = params.fileData; // Blob 데이터
    const fileName = params.fileName;
    const mimeType = params.mimeType;
    
    // 드라이브 폴더 가져오기
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    
    // 파일 타입에 따라 서브폴더 결정
    let subFolderName = 'images';
    if (mimeType.startsWith('video/')) {
      subFolderName = 'videos';
    }
    
    // 서브폴더 가져오기 또는 생성
    const subFolders = folder.getFoldersByName(subFolderName);
    let subFolder;
    if (subFolders.hasNext()) {
      subFolder = subFolders.next();
    } else {
      subFolder = folder.createFolder(subFolderName);
    }
    
    // 고유한 파일명 생성 (타임스탬프 포함)
    const timestamp = new Date().getTime();
    const uniqueFileName = `${timestamp}_${fileName}`;
    
    // Blob 생성 및 파일 업로드
    const blob = Utilities.newBlob(
      Utilities.base64Decode(fileData),
      mimeType,
      uniqueFileName
    );
    
    const file = subFolder.createFile(blob);
    
    // 파일을 웹에서 접근 가능하도록 설정
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // 공개 URL 생성
    const fileId = file.getId();
    
    // 모든 미디어에 동일한 URL 형식 사용
    const publicUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    
    return {
      success: true,
      url: publicUrl,
      fileId: fileId,
      fileName: uniqueFileName
    };
    
  } catch(error) {
    return {
      success: false,
      message: `Upload failed: ${error.toString()}`
    };
  }
}

/**
 * 게시물을 구글 시트에 저장
 */
function savePostToSheet(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    // 마지막 행 번호 가져오기
    const lastRow = sheet.getLastRow();
    
    // 새 ID 생성 (마지막 ID + 1)
    let newId = 1;
    if (lastRow > 1) {
      const lastId = sheet.getRange(lastRow, 1).getValue();
      newId = parseInt(lastId) + 1;
    }
    
    // 현재 시간
    const createdAt = new Date().toISOString();
    
    // 데이터 행 추가
    const rowData = [
      newId,                    // A: id
      params.title || '',       // B: title
      params.category || '',    // C: category
      params.content || '',     // D: content
      params.thumbnail || '',   // E: thumbnail
      createdAt                 // F: createdAt
    ];
    
    sheet.appendRow(rowData);
    
    return {
      success: true,
      id: newId,
      message: 'Post saved successfully',
      createdAt: createdAt
    };
    
  } catch(error) {
    return {
      success: false,
      message: `Save failed: ${error.toString()}`
    };
  }
}

/**
 * 구글 시트에서 게시물 업데이트
 */
function updatePostInSheet(params) {
  try {
    const postId = parseInt(params.id);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return {
        success: false,
        message: 'Post not found'
      };
    }
    
    // 모든 데이터 가져오기
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 6);
    const data = dataRange.getValues();
    
    // ID로 게시물 행 찾기 (실제 시트 행 번호는 +2)
    let rowIndex = -1;
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === postId) {
        rowIndex = i + 2; // 헤더(1) + 인덱스(i) + 1
        break;
      }
    }
    
    if (rowIndex === -1) {
      return {
        success: false,
        message: 'Post not found'
      };
    }
    
    // 업데이트할 데이터 (ID와 createdAt는 유지, 나머지만 업데이트)
    sheet.getRange(rowIndex, 2).setValue(params.title || '');       // B: title
    sheet.getRange(rowIndex, 3).setValue(params.category || '');    // C: category
    sheet.getRange(rowIndex, 4).setValue(params.content || '');     // D: content
    sheet.getRange(rowIndex, 5).setValue(params.thumbnail || '');   // E: thumbnail
    // createdAt는 유지
    
    return {
      success: true,
      id: postId,
      message: 'Post updated successfully'
    };
    
  } catch(error) {
    return {
      success: false,
      message: `Update failed: ${error.toString()}`
    };
  }
}

/**
 * 구글 시트에서 게시물 목록 가져오기
 */
function getPostsFromSheet(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    const lastRow = sheet.getLastRow();
    
    // 헤더만 있거나 데이터가 없는 경우
    if (lastRow <= 1) {
      return {
        success: true,
        posts: [],
        count: 0
      };
    }
    
    // 모든 데이터 가져오기 (헤더 제외)
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 6);
    const data = dataRange.getValues();
    
    // 데이터를 객체 배열로 변환
    const posts = data.map(row => ({
      id: row[0],
      title: row[1],
      category: row[2],
      content: row[3],
      thumbnail: row[4],
      createdAt: row[5]
    }));
    
    // ID 기준 내림차순 정렬 (최신순)
    posts.sort((a, b) => b.id - a.id);
    
    return {
      success: true,
      posts: posts,
      count: posts.length
    };
    
  } catch(error) {
    return {
      success: false,
      message: `Failed to get posts: ${error.toString()}`
    };
  }
}

/**
 * ID로 특정 게시물 가져오기
 */
function getPostById(params) {
  try {
    const postId = parseInt(params.id);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return {
        success: false,
        message: 'Post not found'
      };
    }
    
    // 모든 데이터 가져오기
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 6);
    const data = dataRange.getValues();
    
    // ID로 게시물 찾기
    const postRow = data.find(row => row[0] === postId);
    
    if (!postRow) {
      return {
        success: false,
        message: 'Post not found'
      };
    }
    
    const post = {
      id: postRow[0],
      title: postRow[1],
      category: postRow[2],
      content: postRow[3],
      thumbnail: postRow[4],
      createdAt: postRow[5]
    };
    
    return {
      success: true,
      post: post
    };
    
  } catch(error) {
    return {
      success: false,
      message: `Failed to get post: ${error.toString()}`
    };
  }
}

/**
 * 시트 초기화 (헤더 생성)
 * 처음 한 번만 실행하세요
 */
function initializeSheet() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    // 헤더 설정
    const headers = ['id', 'title', 'category', 'content', 'thumbnail', 'createdAt'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // 헤더 스타일 설정
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#ffd900');
    headerRange.setFontColor('#000000');
    
    // 열 너비 자동 조정
    sheet.autoResizeColumns(1, headers.length);
    
    Logger.log('Sheet initialized successfully');
    return { success: true, message: 'Sheet initialized' };
    
  } catch(error) {
    Logger.log('Initialization failed: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * 드라이브 폴더 구조 초기화
 * 처음 한 번만 실행하세요
 */
function initializeDriveFolders() {
  try {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    
    // 서브폴더 생성
    const subFolders = ['images', 'videos', 'thumbnails'];
    
    subFolders.forEach(folderName => {
      const existing = folder.getFoldersByName(folderName);
      if (!existing.hasNext()) {
        folder.createFolder(folderName);
        Logger.log(`Created folder: ${folderName}`);
      }
    });
    
    Logger.log('Drive folders initialized successfully');
    return { success: true, message: 'Drive folders initialized' };
    
  } catch(error) {
    Logger.log('Drive initialization failed: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}
