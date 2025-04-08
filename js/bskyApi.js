/**
 * 블루스카이 API 관련 기능을 담당하는 모듈
 */
const BskyApi = {
    /**
     * 검색을 수행하는 함수
     * @param {string} query - 검색어
     * @param {number} limit - 검색 결과 수 제한
     * @returns {Promise<Array>} 검색 결과
     */
    async search(query, limit = 20) {
        try {
            const response = await fetch(`https://api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(query)}&limit=${limit}`);
            if (!response.ok) {
                throw new Error('검색 요청 실패');
            }
            
            const data = await response.json();
            return data.posts || [];
        } catch (error) {
            console.error('검색 중 오류 발생:', error);
            throw error;
        }
    },

    /**
     * 블루스카이 URI를 웹 URL로 변환하는 함수
     * @param {string} uri - 블루스카이 URI
     * @param {string} did - 사용자 DID
     * @param {string} postId - 게시글 ID
     * @returns {string} 웹 URL
     */
    convertToWebUrl(uri, did, postId) {
        return `https://bsky.app/profile/${did}/post/${postId}`;
    }
}; 