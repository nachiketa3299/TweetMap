document.getElementById('searchButton').addEventListener('click', performSearch);
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

function convertToWebUrl(uri) {
    // at:// 형식의 URI를 https://bsky.app 형식으로 변환
    const parts = uri.split('/');
    const did = parts[2];
    const rkey = parts[3];
    return `https://bsky.app/profile/${did}/post/${rkey}`;
}

async function performSearch() {
    const searchTerm = document.getElementById('searchInput').value;
    if (!searchTerm) return;

    const resultsList = document.getElementById('results');
    resultsList.innerHTML = '검색 중...';

    try {
        const response = await fetch(`https://api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(searchTerm)}&limit=20`);
        const data = await response.json();

        if (data.posts && data.posts.length > 0) {
            // 표 생성
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            
            // 표 헤더 생성
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            const headers = ['프로필', '별명', '게시글', '계정명', '좋아요', '알티'];
            headers.forEach((headerText, index) => {
                const th = document.createElement('th');
                th.textContent = headerText;
                th.style.padding = '8px';
                th.style.borderBottom = '1px solid #ddd';
                // 각 열의 너비 설정
                if (index === 2) { // 게시글
                    th.style.width = '40%';
                } else if (index === 0) { // 프로필
                    th.style.width = '8%';
                } else if (index === 4 || index === 5) { // 좋아요, 알티
                    th.style.width = '10%';
                } else { // 별명, 계정명
                    th.style.width = '16%';
                }
                headerRow.appendChild(th);
            });
            
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            // 표 본문 생성
            const tbody = document.createElement('tbody');
            
            data.posts.forEach(post => {
                const content = post.record.text;
                const author = post.author.handle;
                const displayName = post.author.displayName || author;
                const title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
                
                // URI에서 게시글 ID 추출
                const uriParts = post.uri.split('/');
                const postId = uriParts[uriParts.length - 1];
                const webUrl = `https://bsky.app/profile/${post.author.did}/post/${postId}`;
                
                const row = document.createElement('tr');
                
                // 프로필 이미지 셀
                const profileCell = document.createElement('td');
                const img = document.createElement('img');
                img.src = post.author.avatar || 'default-avatar.png';
                img.alt = `${author}의 프로필 사진`;
                img.style.width = '20px';
                img.style.height = '20px';
                img.style.borderRadius = '50%';
                profileCell.appendChild(img);
                
                // 별명 셀
                const displayNameCell = document.createElement('td');
                displayNameCell.textContent = displayName;
                
                // 게시글 제목 셀
                const titleCell = document.createElement('td');
                const a = document.createElement('a');
                a.href = webUrl;
                a.textContent = title;
                a.target = '_blank';
                titleCell.appendChild(a);
                
                // 계정명 셀
                const handleCell = document.createElement('td');
                handleCell.textContent = `@${author}`;
                
                // 좋아요 수 셀
                const likeCell = document.createElement('td');
                const likeCount = post.likeCount || 0;
                likeCell.textContent = `❤️ ${likeCount}`;
                
                // 알티(리포스트) 수 셀
                const repostCell = document.createElement('td');
                const repostCount = post.repostCount || 0;
                repostCell.textContent = `🔄 ${repostCount}`;
                
                // 모든 셀에 스타일 적용
                [profileCell, displayNameCell, titleCell, handleCell, likeCell, repostCell].forEach(cell => {
                    cell.style.padding = '8px';
                    cell.style.borderBottom = '1px solid #ddd';
                });
                
                // 행에 셀 추가
                row.appendChild(profileCell);
                row.appendChild(displayNameCell);
                row.appendChild(titleCell);
                row.appendChild(handleCell);
                row.appendChild(likeCell);
                row.appendChild(repostCell);
                
                tbody.appendChild(row);
            });
            
            table.appendChild(tbody);
            resultsList.innerHTML = '';
            resultsList.appendChild(table);
        } else {
            resultsList.innerHTML = '검색 결과가 없습니다.';
        }
    } catch (error) {
        resultsList.innerHTML = '검색 중 오류가 발생했습니다.';
        console.error('Error:', error);
    }
} 