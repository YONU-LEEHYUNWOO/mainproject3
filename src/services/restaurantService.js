// 주변 식당 검색 서비스

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

// 주변 식당 검색
export const searchNearbyRestaurants = async (lat, lng, radius = 1000) => {
  try {
    await waitForKakaoMap()

    return new Promise((resolve, reject) => {
      const places = new window.kakao.maps.services.Places()
      const callback = (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const restaurants = result.map(place => ({
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
          resolve(restaurants)
        } else {
          reject(new Error(`식당 검색 실패: ${status}`))
        }
      }

      places.categorySearch('FD6', callback, {
        location: new window.kakao.maps.LatLng(lat, lng),
        radius: radius,
        sort: window.kakao.maps.services.SortBy.DISTANCE
      })
    })
  } catch (error) {
    console.error('식당 검색 오류:', error)
    // 폴백: 더미 데이터
    return getDummyRestaurants()
  }
}

// 더미 식당 데이터
const getDummyRestaurants = () => {
  return [
    { id: 1, name: '맛있는 식당', address: '서울시 강남구 테헤란로 123', roadAddress: '서울시 강남구 테헤란로 123', phone: '02-1234-5678', category: '한식', lat: 37.5665, lng: 126.9780, distance: 150 },
    { id: 2, name: '우리집 밥상', address: '서울시 강남구 테헤란로 456', roadAddress: '서울시 강남구 테헤란로 456', phone: '02-2345-6789', category: '한식', lat: 37.5670, lng: 126.9785, distance: 300 },
    { id: 3, name: '피자나라', address: '서울시 중구 세종대로 110', roadAddress: '서울시 중구 세종대로 110', phone: '02-3456-7890', category: '양식', lat: 37.5665, lng: 126.9780, distance: 200 }
  ]
}
