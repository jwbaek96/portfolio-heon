// 인증 관리 스크립트
class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        this.checkLoginStatus();
        this.addFloatingButton();
    }

    // 로그인 상태 확인
    isLoggedIn() {
        return sessionStorage.getItem('adminLoggedIn') === 'true';
    }

    // 로그아웃
    logout() {
        sessionStorage.removeItem('adminLoggedIn');
        this.removeFloatingButton();
        alert('Logged out successfully.');
        window.location.reload();
    }

    // 로그인 상태 확인 및 UI 업데이트
    checkLoginStatus() {
        if (this.isLoggedIn()) {
            console.log('Admin is logged in');
        }
    }

    // 플로팅 버튼 추가
    addFloatingButton() {
        if (!this.isLoggedIn()) {
            return;
        }

        // 이미 버튼이 있는지 확인
        if (document.getElementById('adminFloatingBtn')) {
            return;
        }

        // 현재 페이지가 post 페이지인지 확인
        const isPostPage = window.location.pathname.includes('post.html');
        const postId = isPostPage ? new URLSearchParams(window.location.search).get('id') : null;

        // 플로팅 버튼 생성
        const floatingBtn = document.createElement('div');
        floatingBtn.id = 'adminFloatingBtn';
        floatingBtn.className = 'admin-floating-btn';
        
        // post 페이지일 경우 수정/삭제 버튼 추가
        const editButton = isPostPage && postId ? `
            <a href="./editor.html?id=${postId}" class="floating-menu-item">
                Edit Post
            </a>
        ` : '';
        
        const deleteButton = isPostPage && postId ? `
            <button class="floating-menu-item delete-btn" id="deletePostBtn" style="color: #ff4444;">
                Delete Post
            </button>
        ` : '';
        
        floatingBtn.innerHTML = `
            <div class="floating-main-btn" id="floatingMainBtn">+</div>
            <div class="floating-menu" id="floatingMenu">
                ${editButton}
                ${deleteButton}
                <a href="./editor.html" class="floating-menu-item">
                    New Post
                </a>
                <a href="./admin.html" class="floating-menu-item">
                    Admin Dashboard
                </a>
                <button class="floating-menu-item logout-btn" id="logoutBtn">
                    Logout
                </button>
            </div>
        `;

        document.body.appendChild(floatingBtn);

        // 이벤트 리스너 추가
        const mainBtn = document.getElementById('floatingMainBtn');
        const menu = document.getElementById('floatingMenu');
        const logoutBtn = document.getElementById('logoutBtn');
        const deletePostBtn = document.getElementById('deletePostBtn');

        mainBtn.addEventListener('click', () => {
            menu.classList.toggle('active');
            mainBtn.classList.toggle('active');
        });

        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                this.logout();
            }
        });

        // 삭제 버튼 이벤트 (post 페이지에서만)
        if (deletePostBtn && postId) {
            deletePostBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
                    this.deletePost(postId);
                }
            });
        }

        // 메뉴 외부 클릭시 닫기
        document.addEventListener('click', (e) => {
            if (!floatingBtn.contains(e.target)) {
                menu.classList.remove('active');
                mainBtn.classList.remove('active');
            }
        });
    }

    // 플로팅 버튼 제거
    removeFloatingButton() {
        const btn = document.getElementById('adminFloatingBtn');
        if (btn) {
            btn.remove();
        }
    }

    // 게시물 삭제
    async deletePost(postId) {
        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxVrZJ_06E1TLjOxqN9o7MOa_CUrB8Yp-o77HybOggFaaP3jCx5h-Ldg5r5ErqTjat80g/exec';
        
        try {
            // 로딩 표시
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'deleteLoading';
            loadingDiv.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000;color:#fff;font-size:18px;';
            loadingDiv.textContent = 'Deleting post...';
            document.body.appendChild(loadingDiv);

            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'deletePost',
                    id: postId
                })
            });

            const result = await response.json();

            if (result.success) {
                alert('Post deleted successfully!');
                window.location.href = './works.html';
            } else {
                throw new Error(result.message || 'Delete failed');
            }
        } catch (error) {
            alert('Failed to delete post: ' + error.message);
            const loadingDiv = document.getElementById('deleteLoading');
            if (loadingDiv) loadingDiv.remove();
        }
    }
}

// 페이지 로드 시 AuthManager 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AuthManager();
    });
} else {
    new AuthManager();
}
