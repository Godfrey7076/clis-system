'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
    id: string
    cardId: string
    name: string
    email: string | null
    userType: string
    faceEncoding: string
    expiresAt: string | null
    createdAt: string
    updatedAt: string
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('ALL')

    const [formData, setFormData] = useState({
        cardId: '',
        name: '',
        email: '',
        faceEncoding: '',
        userType: 'REGULAR',
        expiresAt: ''
    })

    // Fetch users
    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users')
            const data = await response.json()
            setUsers(data.users || [])
        } catch (error) {
            console.error('Failed to fetch users:', error)
        } finally {
            setLoading(false)
        }
    }

    // Apply filters and search
    useEffect(() => {
        let filtered = users

        // Apply type filter
        if (filterType !== 'ALL') {
            filtered = filtered.filter(user => user.userType === filterType)
        }

        // Apply search
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(user =>
                user.cardId.toLowerCase().includes(term) ||
                user.name.toLowerCase().includes(term) ||
                (user.email && user.email.toLowerCase().includes(term))
            )
        }

        setFilteredUsers(filtered)
    }, [users, searchTerm, filterType])

    // Add new user
    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    expiresAt: formData.expiresAt || null
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to create user')
            }

            // Reset form and refresh users
            setFormData({
                cardId: '',
                name: '',
                email: '',
                faceEncoding: '',
                userType: 'REGULAR',
                expiresAt: ''
            })
            setShowAddForm(false)
            await fetchUsers()
            alert('User created successfully!')

        } catch (error) {
            console.error('Create user error:', error)
            alert('Error: ' + (error as Error).message)
        }
    }

    // Start editing user
    const handleEditUser = (user: User) => {
        setEditingUser(user)
        setFormData({
            cardId: user.cardId,
            name: user.name,
            email: user.email || '',
            faceEncoding: user.faceEncoding,
            userType: user.userType,
            expiresAt: user.expiresAt ? new Date(user.expiresAt).toISOString().slice(0, 16) : ''
        })
    }

    // Update user
    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingUser) return

        try {
            const response = await fetch(`/api/users/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    expiresAt: formData.expiresAt || null
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to update user')
            }

            // Reset form and refresh users
            setEditingUser(null)
            setFormData({
                cardId: '',
                name: '',
                email: '',
                faceEncoding: '',
                userType: 'REGULAR',
                expiresAt: ''
            })
            await fetchUsers()
            alert('User updated successfully!')

        } catch (error) {
            console.error('Update user error:', error)
            alert('Error: ' + (error as Error).message)
        }
    }

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingUser(null)
        setFormData({
            cardId: '',
            name: '',
            email: '',
            faceEncoding: '',
            userType: 'REGULAR',
            expiresAt: ''
        })
    }

    // Delete user
    const handleDeleteUser = async (userId: string, userName: string) => {
        if (confirm(`Are you sure you want to delete user "${userName}"?`)) {
            try {
                const response = await fetch(`/api/users/${userId}`, {
                    method: 'DELETE'
                })

                if (!response.ok) {
                    throw new Error('Failed to delete user')
                }

                await fetchUsers()
                alert('User deleted successfully!')
            } catch (error) {
                console.error('Delete user error:', error)
                alert('Error deleting user')
            }
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">Loading users...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">User Management</h1>
                            <p className="text-gray-600">Manage system users and their access permissions</p>
                        </div>
                        <div className="flex space-x-4">
                            <Link
                                href="/"
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                            >
                                Back to Dashboard
                            </Link>
                            <button
                                onClick={() => {
                                    setShowAddForm(!showAddForm)
                                    setEditingUser(null)
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                            >
                                {showAddForm ? 'Cancel' : 'Add New User'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search Users
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Search by name, card ID, or email..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Filter by Type
                            </label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ALL">All Types</option>
                                <option value="REGULAR">Regular</option>
                                <option value="VISITOR">Visitor</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <div className="text-sm text-gray-600">
                                Showing {filteredUsers.length} of {users.length} users
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add/Edit User Form */}
                {(showAddForm || editingUser) && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            {editingUser ? 'Edit User' : 'Add New User'}
                        </h2>
                        <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Card ID *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.cardId}
                                    onChange={(e) => setFormData({ ...formData, cardId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="EMP001"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="john@company.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    User Type
                                </label>
                                <select
                                    value={formData.userType}
                                    onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="REGULAR">Regular</option>
                                    <option value="VISITOR">Visitor</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Face Encoding *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.faceEncoding}
                                    onChange={(e) => setFormData({ ...formData, faceEncoding: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="face_encoding_data"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Expires At (for visitors)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.expiresAt}
                                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="md:col-span-2 flex space-x-4">
                                <button
                                    type="submit"
                                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md"
                                >
                                    {editingUser ? 'Update User' : 'Create User'}
                                </button>
                                {editingUser && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md"
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                {/* Users List */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        System Users ({filteredUsers.length})
                        <span className="text-sm font-normal text-gray-600 ml-2">
                            (Total: {users.length})
                        </span>
                    </h2>

                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {users.length === 0
                                ? 'No users found. Click "Add New User" to create the first user.'
                                : 'No users match your search criteria.'
                            }
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Card ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Expires
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Last Updated
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {user.cardId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.email || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.userType === 'REGULAR'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                    {user.userType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.expiresAt
                                                    ? new Date(user.expiresAt).toLocaleDateString()
                                                    : 'Never'
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(user.updatedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.name)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}