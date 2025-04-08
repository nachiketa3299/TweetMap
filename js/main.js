document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsDiv = document.getElementById('results');
    const resultCount = document.getElementById('resultCount');
    const minLikes = document.getElementById('minLikes');
    const maxLikes = document.getElementById('maxLikes');
    const requireImage = document.getElementById('requireImage');
    const requireVideo = document.getElementById('requireVideo');

    searchButton.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        if (!query) {
            alert('검색어를 입력해주세요.');
            return;
        }

        try {
            resultsDiv.innerHTML = '<div class="loading">검색 중...</div>';
            
            const limit = parseInt(resultCount.value) || 20;
            const results = await BskyApi.search(query, limit);
            
            if (results.length === 0) {
                resultsDiv.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
                return;
            }

            // 좋아요 필터링
            let filteredResults = results;
            const minLikesValue = minLikes.value ? parseInt(minLikes.value) : null;
            const maxLikesValue = maxLikes.value ? parseInt(maxLikes.value) : null;
            
            if (minLikesValue !== null || maxLikesValue !== null) {
                filteredResults = results.filter(post => {
                    const likeCount = post.likeCount || 0;
                    
                    if (minLikesValue !== null && likeCount < minLikesValue) {
                        return false;
                    }
                    
                    if (maxLikesValue !== null && likeCount > maxLikesValue) {
                        return false;
                    }
                    
                    return true;
                });
            }
            
            // 미디어 필터링
            if (requireImage.checked || requireVideo.checked) {
                filteredResults = filteredResults.filter(post => {
                    const mediaInfo = UIComponents.getMediaInfo(post);
                    
                    if (requireImage.checked && mediaInfo.images.length === 0) {
                        return false;
                    }
                    
                    if (requireVideo.checked && !mediaInfo.isVideo) {
                        return false;
                    }
                    
                    return true;
                });
            }
            
            // 결과 수 제한
            if (filteredResults.length > limit) {
                filteredResults = filteredResults.slice(0, limit);
            }
            
            if (filteredResults.length === 0) {
                resultsDiv.innerHTML = '<div class="no-results">조건에 맞는 검색 결과가 없습니다.</div>';
                return;
            }
            
            const table = UIComponents.createResultTable(filteredResults);
            resultsDiv.innerHTML = '';
            resultsDiv.appendChild(table);
            
            // 결과 수가 제한보다 적은 경우 메시지 추가
            if (filteredResults.length < limit && filteredResults.length < results.length) {
                const message = document.createElement('div');
                message.className = 'result-message';
                message.textContent = '더 이상 찾을 수 있는 결과가 없습니다.';
                resultsDiv.appendChild(message);
            }
        } catch (error) {
            console.error('검색 중 오류 발생:', error);
            resultsDiv.innerHTML = '<div class="error">검색 중 오류가 발생했습니다.</div>';
        }
    });
}); 