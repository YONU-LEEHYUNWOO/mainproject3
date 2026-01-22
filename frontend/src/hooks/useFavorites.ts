import { useState, useEffect } from 'react'
import api from '../services/api'

export interface FavoritePlace {
    id: number
    name: string
    category: string
    address: string
    latitude: number
    longitude: number
}

export const useFavorites = () => {
    const [favorites, setFavorites] = useState<FavoritePlace[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchFavorites = async () => {
        setIsLoading(true)
        try {
            const response = await api.get('/api/favorites/')
            setFavorites(response.data)
        } catch (err) {
            console.error('Failed to fetch favorites:', err)
            setError('즐겨찾기 목록을 불러오지 못했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    const addFavorite = async (name: string, address: string, lat: number, lng: number, category: string = 'other') => {
        try {
            const response = await api.post('/api/favorites/', {
                name,
                address,
                latitude: lat,
                longitude: lng,
                category
            })
            setFavorites([...favorites, response.data])
            return response.data
        } catch (err) {
            console.error('Failed to add favorite:', err)
            throw err
        }
    }

    const removeFavorite = async (id: number) => {
        try {
            await api.delete(`/api/favorites/${id}`)
            setFavorites(favorites.filter(f => f.id !== id))
        } catch (err) {
            console.error('Failed to remove favorite:', err)
            throw err
        }
    }

    useEffect(() => {
        fetchFavorites()
    }, [])

    return {
        favorites,
        isLoading,
        error,
        addFavorite,
        removeFavorite,
        fetchFavorites
    }
}
