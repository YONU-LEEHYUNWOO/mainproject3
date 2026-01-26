import api from './api'

export const requestAPI = {
    create: (c: string) => api.post('/api/parent-requests/', { content: c }),
    getList: (uid?: number) => api.get(`/api/parent-requests/${uid ? `?user_id=${uid}` : ''}`),
    del: (id: number) => api.delete(`/api/parent-requests/${id}`),
    toggle: (id: number) => api.patch(`/api/parent-requests/${id}/toggle`),
    upd: (id: number, c: string) => api.patch(`/api/parent-requests/${id}`, { content: c }),
    getFreq: () => api.get('/api/parent-requests/frequent'),
    addFreq: (n: string) => api.post('/api/parent-requests/frequent', { name: n }),
    delFreq: (id: number) => api.delete(`/api/parent-requests/frequent/${id}`)
}
