// 주변 장소 검색 서비스 (카카오맵 API 사용)

// 카테고리 코드 매핑
const CATEGORY_CODES = {
  '식당': 'FD6',
  '편의점': 'CS2',
  '마트': 'MT1',
  '약국': 'PM9',
  '병원': 'HP8',
  '카페': 'CE7',
  '은행': 'BK9',
  '주유소': 'OL7',
  '주차장': 'PK6'
}

// 카카오맵 API 로드 대기
const waitForKakaoMap = () => {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      resolve()
      return
    }

    let attempts = 0
    const maxAttempts = 50
    
    const checkInterval = setInterval(() => {
      attempts++
      
      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        clearInterval(checkInterval)
        resolve()
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval)
        reject(new Error('카카오맵 API 로드 시간 초과'))
      }
    }, 100)
  })
}

// 주변 장소 검색
export const searchNearbyPlaces = async (lat, lng, placeType, radius = 1000) => {
  try {
    await waitForKakaoMap()

    const categoryCode = CATEGORY_CODES[placeType] || 'FD6'

    return new Promise((resolve, reject) => {
      const places = new window.kakao.maps.services.Places()
      const callback = (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const placesList = result.map(place => ({
            id: place.id,
            name: place.place_name,
            address: place.address_name,
            roadAddress: place.road_address?.address_name || place.address_name,
            phone: place.phone || '',
            category: place.category_name,
            lat: parseFloat(place.y),
            lng: parseFloat(place.x),
            distance: place.distance ? parseInt(place.distance) : null,
            url: place.place_url || ''
          }))
          resolve(placesList)
        } else {
          reject(new Error(`장소 검색 실패: ${status}`))
        }
      }

      places.categorySearch(categoryCode, callback, {
        location: new window.kakao.maps.LatLng(lat, lng),
        radius: radius,
        sort: window.kakao.maps.services.SortBy.DISTANCE
      })
    })
  } catch (error) {
    console.error('장소 검색 오류:', error)
    // 폴백: 더미 데이터
    return getDummyPlaces(placeType)
  }
}

// 더미 장소 데이터
const getDummyPlaces = (placeType) => {
  const basePlaces = {
    '식당': [
      { id: 1, name: '맛있는 식당', address: '서울시 강남구 테헤란로 123', roadAddress: '서울시 강남구 테헤란로 123', phone: '02-1234-5678', category: '한식', lat: 37.5665, lng: 126.9780, distance: 150 },
      { id: 2, name: '우리집 밥상', address: '서울시 강남구 테헤란로 456', roadAddress: '서울시 강남구 테헤란로 456', phone: '02-2345-6789', category: '한식', lat: 37.5670, lng: 126.9785, distance: 300 }
    ],
    '편의점': [
      { id: 1, name: 'GS25 강남점', address: '서울시 강남구 테헤란로 123', roadAddress: '서울시 강남구 테헤란로 123', phone: '', category: '편의점', lat: 37.5665, lng: 126.9780, distance: 100 },
      { id: 2, name: 'CU 세종대로점', address: '서울시 중구 세종대로 110', roadAddress: '서울시 중구 세종대로 110', phone: '', category: '편의점', lat: 37.5665, lng: 126.9780, distance: 200 }
    ],
    '마트': [
      { id: 1, name: '이마트 강남점', address: '서울시 강남구 테헤란로 123', roadAddress: '서울시 강남구 테헤란로 123', phone: '02-1234-5678', category: '마트', lat: 37.5665, lng: 126.9780, distance: 500 }
    ],
    '약국': [
      { id: 1, name: '건강약국', address: '서울시 중구 세종대로 110', roadAddress: '서울시 중구 세종대로 110', phone: '02-1234-5678', category: '약국', lat: 37.5665, lng: 126.9780, distance: 150 }
    ],
    '병원': [
      { id: 1, name: '서울대학교병원', address: '서울시 종로구 대학로 101', roadAddress: '서울시 종로구 대학로 101', phone: '02-2072-2114', category: '병원', lat: 37.5665, lng: 126.9780, distance: 1000 }
    ],
    '카페': [
      { id: 1, name: '스타벅스 강남점', address: '서울시 강남구 테헤란로 123', roadAddress: '서울시 강남구 테헤란로 123', phone: '02-1234-5678', category: '카페', lat: 37.5665, lng: 126.9780, distance: 200 }
    ]
  }

  return basePlaces[placeType] || basePlaces['식당']
}
