// 택시 서비스
export const getActiveRideRequest = (seniorId) => {
  const rides = JSON.parse(localStorage.getItem('carelink_taxi_rides') || '[]')
  return rides.find(r => r.seniorId === seniorId && ['assigned', 'arrived', 'picked_up'].includes(r.status)) || null
}
