import React, { useState, useEffect, useRef } from 'react'
import { Search, MapPin, X, Loader2, Mic, MicOff } from 'lucide-react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'

interface Place {
    id: string
    place_name: string
    address_name: string
    road_address_name?: string
    phone?: string
    x: string
    y: string
    category_group_name?: string
}

interface LocationSearchModalProps {
    isOpen: boolean
    onClose: () => void
    initialQuery: string
    onSelect: (place: Place) => void
    currentLocation?: { latitude: number; longitude: number } | null
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
    isOpen,
    onClose,
    initialQuery,
    onSelect,
    currentLocation
}) => {
    const [keyword, setKeyword] = useState(initialQuery)
    const [results, setResults] = useState<Place[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const searchIdRef = useRef(0)

    // 음성 인식
    const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition()

    // searchPlaces 함수를 먼저 정의
    const searchPlaces = React.useCallback((query: string) => {
        if (!query.trim() || !window.kakao || !window.kakao.maps) return

        const currentSearchId = ++searchIdRef.current
        setIsLoading(true)
        const ps = new window.kakao.maps.services.Places()

        const searchOptions: any = {
            size: 15
        }

        if (currentLocation) {
            searchOptions.location = new window.kakao.maps.LatLng(currentLocation.latitude, currentLocation.longitude)
            searchOptions.sort = window.kakao.maps.services.SortBy.ACCURACY
            console.log(`🔍 [${currentSearchId}] 위치 기반 검색:`, currentLocation.latitude, currentLocation.longitude)
        } else {
            console.log(`🔍 [${currentSearchId}] 전국 검색`)
        }

        ps.keywordSearch(query, (data: any[], status: any) => {
            // 응답이 왔을 때 현재 진행 중인 최신 검색이 아니면 무시 (결과 뒤바뀜 방지)
            if (currentSearchId !== searchIdRef.current) {
                console.log(`⏳ [${currentSearchId}] 무시됨 (최신 검색 아님)`)
                return
            }

            if (status === window.kakao.maps.services.Status.OK) {
                setResults(data)
            } else {
                setResults([])
            }
            setIsLoading(false)
        }, searchOptions)
    }, [currentLocation])

    // 음성 인식 결과를 키워드에 반영
    useEffect(() => {
        if (transcript && isListening) {
            setKeyword(transcript)
        }
    }, [transcript, isListening])

    // 음성 인식 종료 시 검색 실행
    useEffect(() => {
        if (!isListening && transcript) {
            searchPlaces(transcript)
            resetTranscript()
        }
    }, [isListening, transcript, resetTranscript, searchPlaces])

    const handleVoiceToggle = () => {
        if (isListening) {
            stopListening()
        } else {
            startListening()
        }
    }

    const initialSearchDone = useRef(false)

    useEffect(() => {
        if (isOpen && initialQuery) {
            setKeyword(initialQuery)

            // 모달이 열릴 때만 검색 (위치 변경으로 인한 재검색 방지)
            if (!initialSearchDone.current) {
                initialSearchDone.current = true

                // currentLocation이 있으면 즉시 검색, 없으면 짧은 대기 후 검색
                if (currentLocation) {
                    searchPlaces(initialQuery)
                } else {
                    const timer = setTimeout(() => {
                        searchPlaces(initialQuery)
                    }, 1200)
                    return () => clearTimeout(timer)
                }
            }
        } else if (!isOpen) {
            // 모달이 닫히면 초기화
            initialSearchDone.current = false
        }
    }, [isOpen, initialQuery, searchPlaces])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        searchPlaces(keyword)
    }

    const handleClose = () => {
        if (isListening) stopListening()
        resetTranscript()
        onClose()
    }

    // 컴포넌트 언마운트 시 음성 인식 정리
    useEffect(() => {
        return () => {
            if (isListening) {
                stopListening()
            }
        }
    }, [isListening, stopListening])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col" style={{ maxHeight: '80vh' }}>
                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">장소 선택</h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 p-1">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="장소나 주소를 입력하세요 (음성 가능)"
                            className="w-full pl-10 pr-32 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            autoFocus
                        />
                        <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <div className="absolute right-2 top-2 flex gap-2">
                            {isSupported && (
                                <button
                                    type="button"
                                    onClick={handleVoiceToggle}
                                    className={`px-3 py-1.5 rounded-md transition ${isListening
                                            ? 'bg-red-500 text-white animate-pulse'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    title={isListening ? '음성 인식 중지' : '음성으로 검색'}
                                >
                                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                </button>
                            )}
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-1.5 rounded-md hover:bg-blue-600 transition"
                            >
                                검색
                            </button>
                        </div>
                    </form>
                    <p className="text-xs text-gray-500 mt-2 ml-1">
                        * 일정을 등록할 정확한 장소를 선택해 주세요. (음성 인식 후 자동 검색)
                    </p>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            <p className="mt-2 text-sm text-gray-500">장소를 찾는 중입니다...</p>
                        </div>
                    ) : results.length > 0 ? (
                        results.map((place) => (
                            <button
                                key={place.id}
                                onClick={() => onSelect(place)}
                                className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition group flex items-start gap-3"
                            >
                                <div className="mt-1 bg-gray-100 group-hover:bg-blue-100 p-2 rounded-lg text-gray-500 group-hover:text-blue-600 transition">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-gray-900 group-hover:text-blue-700">{place.place_name}</div>
                                    <div className="text-sm text-gray-600 mt-0.5">{place.road_address_name || place.address_name}</div>
                                    {place.phone && <div className="text-xs text-gray-400 mt-1">{place.phone}</div>}
                                </div>
                            </button>
                        ))
                    ) : keyword ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500">검색 결과가 없습니다.</p>
                            <p className="text-sm text-gray-400 mt-1">다른 검색어를 입력해 보세요.</p>
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-400">장소 이름을 입력하여 검색해 주세요.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900"
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
    )
}
