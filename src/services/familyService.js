// 가족 연결 서비스
import { storage } from '../utils/storage'

// 부모님 ID로 가족 연결 조회
export const getFamilyLinkBySenior = (seniorId) => {
  const links = JSON.parse(localStorage.getItem('carelink_family_links') || '[]')
  return links.find(link => link.seniorId === seniorId) || null
}

// 보호자 ID로 가족 연결 조회
export const getFamilyLinksByGuardian = (guardianId) => {
  const links = JSON.parse(localStorage.getItem('carelink_family_links') || '[]')
  return links.filter(link => link.guardianId === guardianId)
}
