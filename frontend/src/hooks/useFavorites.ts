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

    const fetchFavorites = async () => {
        setIsLoading(true)
        try {
            const response = await api.get('/api/favorites/')
            setFavorites(response.data.data || [])
        } catch (error) {
            console.error('Failed to fetch favorites:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const addFavorite = async (place: any) => {
        try {
            const response = await api.post('/api/favorites/', {
                name: place.place_name,
                category: place.category_group_name || 'other',
                address: place.road_address_name || place.address_name,
                latitude: parseFloat(place.y),
                longitude: parseFloat(place.x)
            })
            setFavorites([...favorites, response.data.data])
            return true
        } catch (error) {
            console.error('Failed to add favorite:', error)
            return false
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
        addFavorite,
        removeFavorite,
        fetchFavorites
    }
}
