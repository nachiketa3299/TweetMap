/**
 * 메인 애플리케이션 로직
 */

// 이벤트 리스너 등록
document.getElementById('searchButton').addEventListener('click', performSearch);
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

/**
 * 검색을 수행하고 결과를 표시하는 함수
 */
async function performSearch() {
    const searchTerm = document.getElementById('searchInput').value;
    if (!searchTerm) return;

    const resultsList = document.getElementById('results');
    resultsList.innerHTML = '검색 중...';

    try {
        // API를 통해 게시글 검색
        const data = await BskyApi.searchPosts(searchTerm);

        if (data.posts && data.posts.length > 0) {
            // 검색 결과 테이블 생성 및 표시
            const table = UIComponents.createResultTable(data.posts);
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