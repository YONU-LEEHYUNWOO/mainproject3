import React, { useState, useEffect } from 'react'
import { Bell, Clock, Moon, AlertOctagon, Save } from 'lucide-react'
import { inactivityAPI, guardiansAPI } from '../services/api'

const NotificationSettings = () => {
    const [parentId, setParentId] = useState<number | null>(null)
    const [settings, setSettings] = useState({
        is_enabled: true,
        threshold_hours: 4,
        sleep_start: '22:00',
        sleep_end: '07:00',
        max_reminders: 3,
        guardian_alert_enabled: true
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 관리 중인 부모님 정보 가져오기
                const response = await guardiansAPI.getManagedUsers()
                const managedUsers = response.data.managed_users || []

                if (managedUsers.length > 0) {
                    const pid = managedUsers[0].user_id || managedUsers[0].id // 백엔드 구조에 맞춰 안전하게 접근
                    setParentId(pid)

                    // 설정 가져오기
                    const settingsRes = await inactivityAPI.getSettings(pid)
                    if (settingsRes.data) {
                        setSettings(settingsRes.data)
                    }
                } else {
                    setError('관리중인 부모님 정보가 없습니다.')
                }
            } catch (err: any) {
                console.error('설정 로드 오류:', err)
                setError('설정을 불러오는 중 오류가 발생했습니다.')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!parentId) return

        setSaving(true)
        setSuccess(false)
        try {
            await inactivityAPI.updateSettings(parentId, settings)
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err: any) {
            console.error('설정 저장 오류:', err)
            setError('설정 저장에 실패했습니다.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500">설정을 불러오는 중...</div>

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center space-x-3 mb-8">
                <Bell className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800">알림 및 무활동 감지 설정</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 무활동 감지 활성화 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">무활동 감지 기능</h3>
                            <p className="text-sm text-gray-500">부모님의 비정상적인 무활동 패턴을 감지하여 알림을 보냅니다.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.is_enabled}
                                onChange={(e) => setSettings({ ...settings, is_enabled: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                {settings.is_enabled && (
                    <>
                        {/* 시간 설정 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center space-x-2 mb-4">
                                    <Clock className="h-5 w-5 text-blue-500" />
                                    <h3 className="font-semibold text-gray-800">무활동 기준 시간</h3>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="number"
                                        value={settings.threshold_hours || ''}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setSettings({ ...settings, threshold_hours: isNaN(val) ? 0 : val });
                                        }}
                                        className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                        min="1" max="24"
                                    />
                                    <span className="text-gray-600">시간 동안 활동이 없으면 감지</span>
                                </div>
                                <p className="mt-2 text-xs text-gray-400">* 취침 시간은 제외됩니다.</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center space-x-2 mb-4">
                                    <Moon className="h-5 w-5 text-indigo-500" />
                                    <h3 className="font-semibold text-gray-800">취침 시간 설정</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">시작</label>
                                        <input
                                            type="time"
                                            value={settings.sleep_start}
                                            onChange={(e) => setSettings({ ...settings, sleep_start: e.target.value })}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">종료</label>
                                        <input
                                            type="time"
                                            value={settings.sleep_end}
                                            onChange={(e) => setSettings({ ...settings, sleep_end: e.target.value })}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 알림 설정 */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center space-x-2 mb-6">
                                <AlertOctagon className="h-5 w-5 text-amber-500" />
                                <h3 className="font-semibold text-gray-800">알림 강도 및 연동</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">부모님 확인 요청 횟수</p>
                                        <p className="text-xs text-gray-400">보호자에게 알리기 전 부모님께 확인 알림을 보내는 횟수입니다.</p>
                                    </div>
                                    <input
                                        type="number"
                                        value={settings.max_reminders || ''}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setSettings({ ...settings, max_reminders: isNaN(val) ? 0 : val });
                                        }}
                                        className="w-20 p-2 border border-gray-300 rounded-md"
                                        min="1" max="10"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">보호자 긴급 알림 수신</p>
                                        <p className="text-xs text-gray-400">부모님이 확인 요청에 응답하지 않을 경우 보호자에게 알립니다.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.guardian_alert_enabled}
                                            onChange={(e) => setSettings({ ...settings, guardian_alert_enabled: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
                {success && <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-100 font-medium">설정이 성공적으로 저장되었습니다!</div>}

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all disabled:bg-gray-400"
                    >
                        <Save className="mr-2 h-5 w-5" />
                        {saving ? '저장 중...' : '설정 저장하기'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default NotificationSettings
