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
        
        // post 페이지일 경우 수정 버튼 추가
        const editButton = isPostPage && postId ? `
            <a href="./editor.html?id=${postId}" class="floating-menu-item">
                Edit Post
            </a>
        ` : '';
        
        floatingBtn.innerHTML = `
            <div class="floating-main-btn" id="floatingMainBtn">+</div>
            <div class="floating-menu" id="floatingMenu">
                ${editButton}
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

        mainBtn.addEventListener('click', () => {
            menu.classList.toggle('active');
            mainBtn.classList.toggle('active');
        });

        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                this.logout();
            }
        });

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
}

// 페이지 로드 시 AuthManager 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AuthManager();
    });
} else {
    new AuthManager();
}
