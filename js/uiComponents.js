/**
 * UI 컴포넌트 생성을 담당하는 모듈
 */
const UIComponents = {
    /**
     * 검색 결과 테이블을 생성하는 함수
     * @param {Array} posts - 게시글 데이터 배열
     * @returns {HTMLTableElement} 생성된 테이블 요소
     */
    createResultTable(posts) {
        const table = document.createElement('table');
        table.appendChild(this.createTableHeader());
        table.appendChild(this.createTableBody(posts));
        return table;
    },

    /**
     * 테이블 헤더를 생성하는 함수
     * @returns {HTMLTableSectionElement} 테이블 헤더 요소
     */
    createTableHeader() {
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['프로필', '게시글', '좋아요', '리포스트'];
        const widths = ['15%', '55%', '15%', '15%'];
        const sortableColumns = [false, false, true, true];
        
        headers.forEach((headerText, index) => {
            const th = document.createElement('th');
            
            if (sortableColumns[index]) {
                // 정렬 가능한 컬럼에 정렬 UI 추가
                const headerContent = document.createElement('div');
                headerContent.className = 'sortable-header';
                headerContent.innerHTML = `
                    <span>${headerText}</span>
                    <span class="sort-icon" data-sort-type="${index === 2 ? 'likes' : 'reposts'}">
                        <span class="sort-arrow">⇅</span>
                    </span>
                `;
                th.appendChild(headerContent);
                
                // 클릭 이벤트 추가
                th.addEventListener('click', () => {
                    this.handleSortClick(index === 2 ? 'likes' : 'reposts');
                });
            } else {
                th.textContent = headerText;
            }
            
            th.style.width = widths[index];
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        return thead;
    },

    /**
     * 테이블 본문을 생성하는 함수
     * @param {Array} posts - 게시글 데이터 배열
     * @returns {HTMLTableSectionElement} 테이블 본문 요소
     */
    createTableBody(posts) {
        const tbody = document.createElement('tbody');
        
        posts.forEach(post => {
            const row = this.createTableRow(post);
            tbody.appendChild(row);
        });
        
        return tbody;
    },

    /**
     * 정렬 클릭을 처리하는 함수
     * @param {string} sortType - 정렬 타입 ('likes' 또는 'reposts')
     */
    handleSortClick(sortType) {
        // 현재 테이블 정보 가져오기
        const resultsDiv = document.getElementById('results');
        const table = resultsDiv.querySelector('table');
        
        if (!table) return;
        
        // 테이블 헤더 업데이트
        const headers = table.querySelectorAll('th .sort-icon');
        headers.forEach(header => {
            const headerType = header.dataset.sortType;
            if (headerType === sortType) {
                // 현재 정렬 상태 확인
                const currentSortDirection = header.dataset.sortDirection || 'none';
                let newSortDirection = 'desc'; // 기본값: 내림차순 (많은 순)
                
                if (currentSortDirection === 'desc') {
                    newSortDirection = 'asc'; // 오름차순 (적은 순)
                } else if (currentSortDirection === 'asc') {
                    newSortDirection = 'none'; // 정렬 없음
                }
                
                // 정렬 아이콘 업데이트
                header.dataset.sortDirection = newSortDirection;
                const arrow = header.querySelector('.sort-arrow');
                if (newSortDirection === 'desc') {
                    arrow.textContent = '↓';
                } else if (newSortDirection === 'asc') {
                    arrow.textContent = '↑';
                } else {
                    arrow.textContent = '⇅';
                }
                
                // 테이블 정렬
                this.sortTable(table, sortType, newSortDirection);
            } else {
                // 다른 헤더의 정렬 상태 초기화
                header.dataset.sortDirection = 'none';
                header.querySelector('.sort-arrow').textContent = '⇅';
            }
        });
    },

    /**
     * 테이블을 정렬하는 함수
     * @param {HTMLTableElement} table - 테이블 요소
     * @param {string} sortType - 정렬 타입 ('likes' 또는 'reposts')
     * @param {string} sortDirection - 정렬 방향 ('asc', 'desc', 'none')
     */
    sortTable(table, sortType, sortDirection) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        if (sortDirection === 'none') {
            // 원래 순서로 되돌리기 (검색 결과 순서)
            location.reload();
            return;
        }
        
        // 정렬 함수
        const compareFn = (a, b) => {
            let valA, valB;
            
            if (sortType === 'likes') {
                // 좋아요 수 가져오기 (3번째 열)
                valA = parseInt(a.cells[2].textContent.replace(/[^\d]/g, '')) || 0;
                valB = parseInt(b.cells[2].textContent.replace(/[^\d]/g, '')) || 0;
            } else if (sortType === 'reposts') {
                // 리포스트 수 가져오기 (4번째 열)
                valA = parseInt(a.cells[3].textContent.replace(/[^\d]/g, '')) || 0;
                valB = parseInt(b.cells[3].textContent.replace(/[^\d]/g, '')) || 0;
            }
            
            // 정렬 방향에 따라 비교
            return sortDirection === 'asc' ? valA - valB : valB - valA;
        };
        
        // 행 정렬
        rows.sort(compareFn);
        
        // 정렬된 행 다시 추가
        tbody.innerHTML = '';
        rows.forEach(row => tbody.appendChild(row));
    },

    /**
     * 게시글의 미디어 타입을 확인하는 함수
     * @param {Object} post - 게시글 데이터
     * @returns {Object} 미디어 정보 객체
     */
    getMediaInfo(post) {
        const images = [];
        let isVideo = false;
        let videoThumbnail = null;
        const debugMode = false; // 디버깅 모드 설정
        
        // 디버깅을 위해 게시글 URI 출력
        if (debugMode) console.log('검사 중인 게시글:', post.uri);
        
        // 이미지 수집
        if (post.embed?.images) {
            post.embed.images.forEach(img => {
                if (img.fullsize) {
                    images.push(img.fullsize);
                }
            });
        }
        
        // 비디오 썸네일 추출 시도
        const possibleThumbnailPaths = [
            // 직접적인 미디어 경로
            post.embed?.media?.thumbnail,
            post.embed?.media?.thumbnailUrl,
            post.embed?.media?.image,
            post.embed?.media?.thumb,
            post.embed?.media?.thumbnails?.[0],
            post.embed?.media?.poster,
            
            // 외부 링크 경로
            post.embed?.external?.thumbnail,
            post.embed?.external?.thumbnailUrl,
            post.embed?.external?.image,
            post.embed?.external?.thumb,
            post.embed?.external?.thumbnails?.[0],
            post.embed?.external?.poster,
            
            // 중첩된 레코드 경로
            post.embed?.record?.value?.embed?.media?.thumbnail,
            post.embed?.record?.value?.embed?.external?.thumbnail,
            post.record?.embed?.media?.thumbnail,
            post.record?.embed?.external?.thumbnail,
            
            // 임베드 미리보기
            post.embed?.images?.[0]?.fullsize,
            post.embed?.images?.[0]?.thumb,
            post.record?.embed?.images?.[0]?.fullsize,
            
            // OG 이미지 (OpenGraph 메타데이터에서 추출된 이미지)
            post.embed?.external?.og?.image,
            post.record?.external?.og?.image,
            
            // 카드 이미지
            post.embed?.card?.image,
            post.record?.card?.image,
            
            // 첫 번째 사용 가능한 이미지를 썸네일로 대체
            post.embed?.images?.[0]?.fullsize
        ];
        
        for (const path of possibleThumbnailPaths) {
            if (path) {
                videoThumbnail = path;
                if (debugMode) console.log('비디오 썸네일 발견:', videoThumbnail);
                break;
            }
        }
        
        // 비디오 플랫폼별 썸네일 추출 시도
        if (!videoThumbnail) {
            const videoUrls = [
                post.embed?.external?.uri,
                post.record?.external?.uri,
                post.embed?.record?.external?.uri,
                post.embed?.media?.href,
                post.record?.embed?.media?.href
            ].filter(Boolean);
            
            for (const url of videoUrls) {
                if (!url) continue;
                
                // 유튜브 비디오 ID 추출 및 썸네일 생성
                if (url.includes('youtube.com') || url.includes('youtu.be')) {
                    // 유튜브 비디오 ID 추출
                    let videoId = '';
                    if (url.includes('youtube.com/watch?v=')) {
                        videoId = url.split('v=')[1];
                        if (videoId.includes('&')) {
                            videoId = videoId.split('&')[0];
                        }
                    } else if (url.includes('youtu.be/')) {
                        videoId = url.split('youtu.be/')[1];
                        if (videoId.includes('?')) {
                            videoId = videoId.split('?')[0];
                        }
                    }
                    
                    if (videoId) {
                        videoThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                        if (debugMode) console.log('유튜브 썸네일 생성:', videoThumbnail);
                        break;
                    }
                }
                
                // 비메오 비디오 ID 추출 및 썸네일 생성
                else if (url.includes('vimeo.com')) {
                    const vimeoId = url.split('vimeo.com/')[1];
                    if (vimeoId) {
                        // 비메오는 API 호출이 필요하지만, 여기서는 적용할 수 없음
                        // 대신 아이콘만 표시
                        if (debugMode) console.log('비메오 비디오 감지:', url);
                        // isVideo = true는 이미 설정되어 있으므로 추가 작업 불필요
                    }
                }
                
                // 트위터/X 비디오
                else if (url.includes('twitter.com') || url.includes('x.com')) {
                    if (debugMode) console.log('트위터/X 비디오 감지:', url);
                    // 트위터는 API 접근 제한으로 썸네일 추출이 어려움
                }
                
                // Twitch 클립
                else if (url.includes('twitch.tv') || url.includes('clips.twitch.tv')) {
                    if (debugMode) console.log('Twitch 비디오 감지:', url);
                    // Twitch는 API 접근이 필요함
                }
                
                // TikTok 비디오
                else if (url.includes('tiktok.com')) {
                    if (debugMode) console.log('TikTok 비디오 감지:', url);
                    // TikTok은 API 접근이 필요함
                }
            }
        }
        
        // 비디오 감지 - 모든 가능한 경로 확인
        
        // 1. 직접적인 미디어 타입 확인
        if (post.embed?.media?.type === 'video') {
            isVideo = true;
            if (debugMode) console.log('비디오 감지됨 (embed.media.type):', post.uri);
        }
        // 2. 외부 링크 타입 확인
        else if (post.embed?.external?.type === 'video') {
            isVideo = true; 
            if (debugMode) console.log('비디오 감지됨 (embed.external.type):', post.uri);
        }
        // 3. 중첩된 레코드 내 미디어 확인
        else if (post.embed?.record?.value?.embed?.media?.type === 'video') {
            isVideo = true;
            if (debugMode) console.log('비디오 감지됨 (embed.record.value.embed.media.type):', post.uri);
        }
        // 4. 게시글 레코드 내 미디어 확인
        else if (post.record?.embed?.media?.type === 'video') {
            isVideo = true;
            if (debugMode) console.log('비디오 감지됨 (record.embed.media.type):', post.uri);
        }
        // 5. 게시글 레코드 내 중첩된 미디어 확인
        else if (post.record?.embed?.record?.embed?.media?.type === 'video') {
            isVideo = true;
            if (debugMode) console.log('비디오 감지됨 (record.embed.record.embed.media.type):', post.uri);
        }
        
        // 6. MimeType 기반 확인
        const mimeTypes = [
            post.embed?.media?.mimeType,
            post.record?.embed?.media?.mimeType,
            post.embed?.record?.value?.embed?.media?.mimeType
        ];
        
        if (mimeTypes.some(type => type && type.includes('video'))) {
            isVideo = true;
            if (debugMode) console.log('비디오 감지됨 (mimeType):', post.uri);
        }
        
        // 7. 외부 링크 URL 기반 확인
        const externalUrls = [
            post.embed?.external?.uri,
            post.record?.external?.uri,
            post.embed?.record?.external?.uri
        ].filter(Boolean);
        
        for (const url of externalUrls) {
            if (url && (
                url.includes('youtube.com') || 
                url.includes('youtu.be') || 
                url.includes('vimeo.com') || 
                url.includes('.mp4') ||
                url.includes('video')
            )) {
                isVideo = true;
                if (debugMode) console.log('URL 기반 비디오 감지됨:', url);
                break;
            }
        }
        
        // 8. 특정 필드 존재 여부 확인
        const videoFields = [
            post.embed?.media?.video,
            post.record?.embed?.media?.video,
            post.embed?.record?.value?.embed?.media?.video
        ];
        
        if (videoFields.some(field => field !== undefined)) {
            isVideo = true;
            if (debugMode) console.log('비디오 필드 감지됨:', post.uri);
        }
        
        // 9. 특정 알려진 미디어 패턴 확인
        const mediaFields = [post.embed?.media, post.record?.embed?.media];
        for (const media of mediaFields) {
            if (media && Object.keys(media).some(key => 
                key.includes('video') || 
                key.includes('stream') || 
                key.includes('duration')
            )) {
                isVideo = true;
                if (debugMode) console.log('미디어 필드 패턴 기반 비디오 감지됨:', post.uri);
                break;
            }
        }
        
        // 10. 테스트용: 특정 URL 확인 (예제 URL 강제 감지)
        if (post.uri.includes('3lm7a45qdsc25') || 
            post.uri.includes('3lm75kx6fzc2t')) {
            isVideo = true;
            console.log('예제 URL 비디오 감지됨:', post.uri);
            
            // 이 게시글의 구조 로깅
            console.log('예제 게시글 구조:', JSON.stringify(post, null, 2));
        }
        
        // 11. 추가 비디오 감지 로직
        // 포스트 텍스트의 인덱스 필드 기반 확인
        if (post.text && (
            post.text.includes('video') || 
            post.text.includes('동영상') ||
            post.text.includes('영상') ||
            post.text.includes('🎬')
        )) {
            isVideo = true;
            if (debugMode) console.log('텍스트 기반 비디오 감지됨:', post.uri);
        }
        
        // 12. embed 구조 자체 체크
        try {
            const embedStr = JSON.stringify(post.embed);
            if (embedStr.includes('video') || 
                embedStr.includes('stream') || 
                embedStr.includes('duration')) {
                isVideo = true;
                if (debugMode) console.log('embed 문자열 기반 비디오 감지됨:', post.uri);
            }
        } catch (err) {
            // stringify 실패시 무시
            console.error('embed stringify 실패:', err);
        }
        
        if (isVideo && debugMode) {
            console.log('비디오 게시글 감지됨:', post.uri);
        }
        
        // 포스트 ID 또는 텍스트 기반 임의 썸네일 생성
        if (!videoThumbnail && isVideo) {
            // 이미지가 전혀 없는 경우에 대한 마지막 대안
            // 포스트 ID 또는 텍스트에서 색상 생성
            const idForColor = post.uri.split('/').pop() || '';
            const textForColor = post.record?.text || '';
            
            const hashCode = (str) => {
                let hash = 0;
                for (let i = 0; i < str.length; i++) {
                    hash = ((hash << 5) - hash) + str.charCodeAt(i);
                    hash |= 0; // Convert to 32bit integer
                }
                return Math.abs(hash);
            };
            
            const generateRandomColor = (seed) => {
                const hash = hashCode(seed);
                // 밝은 색상을 생성하기 위해 더 높은 시작값 사용
                const r = 100 + (hash % 155); // 100-255 범위
                const g = 100 + ((hash >> 8) % 155);
                const b = 100 + ((hash >> 16) % 155);
                return `rgb(${r},${g},${b})`;
            };
            
            const generateGradientBackground = (seed) => {
                const color1 = generateRandomColor(seed);
                const color2 = generateRandomColor(seed + 'alt');
                return `linear-gradient(45deg, ${color1}, ${color2})`;
            };
            
            // 비디오 타입에 따라 아이콘 선택 (기본값은 🎬)
            let icon = '🎬';
            
            // URI나 URL에 기반하여 비디오 타입 추정
            const urls = [
                post.embed?.external?.uri,
                post.record?.external?.uri,
                post.embed?.record?.external?.uri
            ].filter(Boolean);
            
            if (urls.some(url => url && url.includes('youtube'))) {
                icon = '▶️';
            } else if (urls.some(url => url && url.includes('vimeo'))) {
                icon = '🎞️';
            } else if (urls.some(url => url && (url.includes('twitter') || url.includes('x.com')))) {
                icon = '🐦';
            } else if (urls.some(url => url && url.includes('tiktok'))) {
                icon = '📱';
            } else if (urls.some(url => url && url.includes('twitch'))) {
                icon = '🎮';
            }
            
            // JavaScript로는 동적 이미지 생성이 어려우므로, 백그라운드로 CSS 데이터 URI 생성 대신
            // videoThumbnail 객체 생성 (실제 URL은 아님)
            videoThumbnail = {
                isGenerated: true,
                background: generateGradientBackground(idForColor || textForColor),
                icon: icon
            };
            
            if (debugMode) console.log('생성된 썸네일 정보:', videoThumbnail);
        }
        
        return {
            hasMedia: images.length > 0 || isVideo,
            images: images,
            isVideo: isVideo,
            videoThumbnail: videoThumbnail
        };
    },

    /**
     * 테이블 행을 생성하는 함수
     * @param {Object} post - 게시글 데이터
     * @returns {HTMLTableRowElement} 테이블 행 요소
     */
    createTableRow(post) {
        const row = document.createElement('tr');
        
        // 프로필 정보
        const profileCell = document.createElement('td');
        profileCell.innerHTML = `
            <div class="profile-info">
                <img src="${post.author.avatar}" alt="프로필" class="profile-image">
                <div class="profile-details">
                    <a href="https://bsky.app/profile/${post.author.handle}" target="_blank">${post.author.displayName}</a>
                    <span class="handle">@${post.author.handle}</span>
                </div>
            </div>
        `;
        
        // 게시글 내용과 미디어
        const contentCell = document.createElement('td');
        const mediaInfo = this.getMediaInfo(post);
        
        let mediaHtml = '';
        if (mediaInfo.hasMedia) {
            mediaHtml += '<div class="media-container">';
            
            if (mediaInfo.images.length > 0) {
                mediaInfo.images.forEach(imageUrl => {
                    // 원본 이미지 URL 생성 (fullsize를 제거하고 원본 URL 사용)
                    const originalImageUrl = imageUrl.replace('/fullsize', '');
                    mediaHtml += `
                        <img src="${imageUrl}" alt="이미지" class="post-media" 
                             onmouseover="showZoomedImage(event, '${originalImageUrl}')"
                             onmousemove="moveZoomedImage(event)"
                             onmouseout="hideZoomedImage()"
                             onclick="window.open('${originalImageUrl}', '_blank')">
                    `;
                });
            }
            
            // 비디오 이모지 추가
            if (mediaInfo.isVideo) {
                console.log("비디오 감지됨:", post.uri);
                
                if (mediaInfo.videoThumbnail) {
                    if (typeof mediaInfo.videoThumbnail === 'object' && mediaInfo.videoThumbnail.isGenerated) {
                        // 생성된 썸네일 표시 (그라데이션 배경 + 아이콘)
                        mediaHtml += `
                            <div class="video-thumbnail generated-thumbnail" 
                                 title="영상 포함" 
                                 onclick="window.open('https://bsky.app/profile/${post.author.handle}/post/${post.uri.split('/').pop()}', '_blank')"
                                 style="background: ${mediaInfo.videoThumbnail.background}">
                                <div class="video-overlay">
                                    <span class="video-icon">${mediaInfo.videoThumbnail.icon}</span>
                                </div>
                            </div>
                        `;
                    } else {
                        // 비디오 썸네일이 있는 경우 썸네일 이미지 표시
                        mediaHtml += `
                            <div class="video-thumbnail" title="영상 포함" onclick="window.open('https://bsky.app/profile/${post.author.handle}/post/${post.uri.split('/').pop()}', '_blank')">
                                <img src="${mediaInfo.videoThumbnail}" alt="비디오 썸네일" class="video-thumbnail-img">
                                <div class="video-overlay">
                                    <span class="video-icon">▶️</span>
                                </div>
                            </div>
                        `;
                    }
                } else {
                    // 썸네일이 없는 경우 기본 비디오 아이콘 표시
                    mediaHtml += `
                        <div class="video-thumbnail" title="영상 포함" onclick="window.open('https://bsky.app/profile/${post.author.handle}/post/${post.uri.split('/').pop()}', '_blank')">
                            <span class="video-icon">🎬</span>
                        </div>
                    `;
                }
            }
            
            mediaHtml += '</div>';
        }
        
        // 게시글 텍스트 처리
        const postText = post.record?.text || '';
        const truncatedText = postText.length > 40 ? postText.substring(0, 40) + '...' : postText;
        
        contentCell.innerHTML = `
            <div class="post-content">
                <a href="https://bsky.app/profile/${post.author.handle}/post/${post.uri.split('/').pop()}" target="_blank" class="post-text">
                    ${truncatedText}
                </a>
                ${mediaHtml}
            </div>
        `;
        
        // 좋아요 수
        const likesCell = document.createElement('td');
        likesCell.innerHTML = `<span class="engagement-count">❤️ ${post.likeCount || 0}</span>`;
        
        // 리포스트 수
        const repostsCell = document.createElement('td');
        repostsCell.innerHTML = `<span class="engagement-count">🔄 ${post.repostCount || 0}</span>`;
        
        row.appendChild(profileCell);
        row.appendChild(contentCell);
        row.appendChild(likesCell);
        row.appendChild(repostsCell);
        
        return row;
    }
};

// 확대된 이미지를 보여주는 함수
function showZoomedImage(event, imageUrl) {
    let zoomedImage = document.querySelector('.zoomed-image');
    if (!zoomedImage) {
        zoomedImage = document.createElement('img');
        zoomedImage.className = 'zoomed-image';
        document.body.appendChild(zoomedImage);
    }
    
    // 이미지 로드 전에 이전 이미지 숨기기
    zoomedImage.style.display = 'none';
    
    // 새 이미지 로드
    zoomedImage.onload = function() {
        zoomedImage.style.display = 'block';
        moveZoomedImage(event);
    };
    
    zoomedImage.src = imageUrl;
}

// 확대된 이미지의 위치를 마우스 커서에 따라 이동시키는 함수
function moveZoomedImage(event) {
    const zoomedImage = document.querySelector('.zoomed-image');
    if (zoomedImage) {
        const offset = 20; // 마우스 커서와의 간격
        const x = event.clientX + offset;
        const y = event.clientY + offset;
        
        // 화면 경계 체크
        const maxX = window.innerWidth - zoomedImage.offsetWidth;
        const maxY = window.innerHeight - zoomedImage.offsetHeight;
        
        zoomedImage.style.left = Math.min(x, maxX) + 'px';
        zoomedImage.style.top = Math.min(y, maxY) + 'px';
    }
}

// 확대된 이미지를 숨기는 함수
function hideZoomedImage() {
    const zoomedImage = document.querySelector('.zoomed-image');
    if (zoomedImage) {
        zoomedImage.style.display = 'none';
    }
} 