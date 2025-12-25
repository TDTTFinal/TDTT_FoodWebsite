import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Heart, Star, Settings, Camera, LogOut, ChevronRight, MapPin, Package, Shield, Map, Mail, Phone, Calendar, MessageSquare, ArrowLeft, Edit, Image, Layers, X, Grid, List } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RestaurantCard from '../components/RestaurantCard';
import FeedReviewCard from '../components/feed/FeedReviewCard'; // Import FeedReviewCard for Modal
import api from '../config/api';

const ProfilePage = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState('info');
  const [profile, setProfile] = useState(null);
  const [foodTours, setFoodTours] = useState([]); // State cho food tours
  const [reviews, setReviews] = useState([]); // State cho reviews
  const [selectedReview, setSelectedReview] = useState(null); // State for Modal (Gallery View)
  const [editingReview, setEditingReview] = useState(null); // State for Edit Modal
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Settings Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Mock Data

  const mockFavorites = [];

  const mockReviews = [
    {
      id: 'REV-001',
      restaurant: {
        name: 'Quán Phở Hà Nội',
        avatar_url: 'https://placehold.co/100x100/FF6B35/FFF?text=PHO'
      },
      rating: 5,
      comment: 'Phở rất ngon, nước dùng đậm đà, thịt bò tươi. Sẽ quay lại!',
      date: '2024-12-10'
    },
    {
      id: 'REV-002',
      restaurant: {
        name: 'Cơm Tấm Sài Gòn',
        avatar_url: 'https://placehold.co/100x100/4ECDC4/FFF?text=COM'
      },
      rating: 4,
      comment: 'Cơm tấm ngon, sườn mềm. Giá cả hợp lý.',
      date: '2024-12-08'
    }
  ];

  useEffect(() => {
    if (user) {
      setProfile({
        ...user,
        avatar_url: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=FF6B35&color=fff&size=200`,
        joinedDate: '2024-01-15',
        stats: {
          favorites: mockFavorites.length,
          reviews: 0 // Will update after fetch
        }
      });
      // Initialize form data
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || ''
      });
      setLoading(false);

      // Fetch Food Tours
      const fetchTours = async () => {
        try {
          const res = await api.get('/food-tours');
          if (res.success) {
            setFoodTours(res.tours);
          }
        } catch (err) {
          console.error("Lỗi lấy danh sách tour:", err);
        }
      };

      // Fetch User Reviews
      const fetchUserReviews = async () => {
        try {
          const res = await api.get(`/reviews/user/${user._id}`);
          if (res.success) {
            setReviews(res.data);
            // Update review count in profile stats
            setProfile(prev => ({
              ...prev,
              stats: {
                 ...prev.stats,
                 reviews: res.pagination.total
              }
            }));
          }
        } catch (err) {
          console.error("Lỗi lấy danh sách đánh giá:", err);
        }
      };

      fetchTours();
      fetchUserReviews();
    }
  }, [user]);



  // Review Actions
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    try {
      const res = await api.delete(`/reviews/${reviewId}`);
      if (res.success) {
        setReviews(reviews.filter(r => r._id !== reviewId));
        setProfile(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            reviews: prev.stats.reviews - 1
          }
        }));
        setMessage('✅ Đã xóa đánh giá');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error("Lỗi xóa review:", err);
      setError('Lỗi khi xóa đánh giá');
    }
  };

  const handleEditClick = (review) => {
    setEditingReview({
      ...review,
      originalRating: review.rating,
      originalContent: review.content
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingReview) return;

    try {
      const res = await api.put(`/reviews/${editingReview._id}`, {
        rating: editingReview.rating,
        content: editingReview.content
      });

      if (res.success) {
        setReviews(reviews.map(r => r._id === editingReview._id ? { ...r, rating: editingReview.rating, content: editingReview.content } : r));
        setEditingReview(null);
        setMessage('✅ Đã cập nhật đánh giá');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error("Lỗi cập nhật review:", err);
      setError('Lỗi khi cập nhật đánh giá');
    }
  };

  // Avatar upload handlers
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File quá lớn! Tối đa 5MB.');
        return;
      }
      
      // Kiểm tra file type
      if (!file.type.startsWith('image/')) {
        setError('Chỉ chấp nhận file ảnh!');
        return;
      }

      // Preview ảnh ngay lập tức
      const previewUrl = URL.createObjectURL(file);
      setProfile({ ...profile, avatar_url: previewUrl });
      
      // Auto upload
      handleUploadAvatar(file);
    }
  };

  const handleUploadAvatar = async (file) => {
    setUploading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/users/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.success) {
        setMessage('✅ Cập nhật ảnh đại diện thành công!');
        setProfile({ ...profile, avatar_url: response.url });
        // Cập nhật vào AuthContext và localStorage
        updateUser({ avatar: response.url });
        // Debug logging
        console.log('✅ Avatar updated in profile:', response.url);
        console.log('👤 User object after update:', user);
        // Tự động ẩn message sau 3s
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(response.message || 'Upload thất bại');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Lỗi khi upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    console.log('📤 Sending profile update:', formData);

    try {
      const response = await api.put('/users/profile', formData);

      console.log('📥 Backend response:', response);

      if (response.success) {
        setMessage('✅ Cập nhật thông tin thành công!');
        // Update profile state
        setProfile({ ...profile, ...formData });
        // Update AuthContext
        updateUser(formData);
        // Auto hide message
        setTimeout(() => setMessage(''), 3000);
      } else {
        console.error('❌ Update failed:', response.message);
        setError(response.message || 'Cập nhật thất bại');
      }
    } catch (err) {
      console.error('❌ Update profile error:', err);
      console.error('❌ Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Mật khẩu mới không khớp!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.success) {
        setMessage('✅ Đổi mật khẩu thành công!');
        // Reset form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(response.message || 'Đổi mật khẩu thất bại');
      }
    } catch (err) {
      console.error('Change password error:', err);
      setError(err.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ xác nhận' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đã xác nhận' },
      delivered: { bg: 'bg-green-100', text: 'text-green-700', label: 'Đã giao' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã hủy' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 ${badge.bg} ${badge.text} text-xs font-semibold rounded-full`}>
        {badge.label}
      </span>
    );
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Quay về trang chủ</span>
        </button>

        {/* Messages */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl animate-in fade-in">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl animate-in fade-in">
            {error}
          </div>
        )}

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              
              {/* Avatar Section */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-orange-100 shadow-lg"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className={`absolute bottom-0 right-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all ${
                      uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600 cursor-pointer'
                    }`}
                  >
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera size={18} />
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploading}
                    className="hidden"
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mt-4">{profile.name}</h2>
                <p className="text-sm text-gray-500 flex items-center gap-1 justify-center mt-1">
                  <Calendar size={14} />
                  Tham gia: {new Date(profile.joinedDate).toLocaleDateString('vi-VN')}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="text-center p-3 bg-pink-50 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600">{profile.stats.favorites}</div>
                  <div className="text-xs text-gray-600 mt-1">Yêu thích</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{profile.stats.reviews}</div>
                  <div className="text-xs text-gray-600 mt-1">Đánh giá</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('settings')}
                  className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Settings size={18} className="text-gray-400" />
                  <span className="font-semibold">Cài đặt tài khoản</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                  <span className="font-semibold">Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 xl:col-span-9">
            
            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
              <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'info'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <User size={20} />
                  Hồ sơ
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'favorites'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Heart size={20} />
                  Yêu thích
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'reviews'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Star size={20} />
                  Đánh giá
                </button>
                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'gallery'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Image size={20} />
                  Thư viện ảnh
                </button>
                <button
                  onClick={() => setActiveTab('tours')}
                  className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'tours'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Map size={20} />
                  Tour của tôi
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'settings'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Settings size={20} />
                  Cài đặt
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              
              {/* Info Tab */}
              {activeTab === 'info' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Thông tin cá nhân</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tên</p>
                        <p className="font-bold text-gray-800">{profile.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Mail size={24} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-bold text-gray-800">{profile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Phone size={24} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Số điện thoại</p>
                        <p className="font-bold text-gray-800">{profile.phone || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <MapPin size={24} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Địa chỉ</p>
                        <p className="font-bold text-gray-800">{profile.address || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Favorites Tab */}
              {activeTab === 'favorites' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Quán yêu thích</h3>
                  {mockFavorites.length === 0 ? (
                    <div className="text-center py-16">
                      <Heart size={64} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-lg font-semibold text-gray-400">Bạn chưa lưu quán nào</p>
                      <button
                        onClick={() => navigate('/search')}
                        className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Khám phá ngay
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {/* Will use RestaurantCard component */}
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Đánh giá của tôi</h3>
                  {reviews.length === 0 ? (
                    <div className="text-center py-16">
                      <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-lg font-semibold text-gray-400">Bạn chưa có đánh giá nào</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div
                          key={review._id}
                          className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <img
                              src={review.restaurant?.avatar_url || 'https://placehold.co/100x100/E0E0E0/999?text=No+Image'}
                              alt={review.restaurant?.name}
                              className="w-12 h-12 rounded-lg object-cover"
                              onError={(e) => {
                                e.target.src = 'https://placehold.co/100x100/E0E0E0/999?text=No+Image';
                              }}
                            />
                            <div className="flex-1">
                              <p className="font-bold text-gray-800">{review.restaurant?.name || 'Nhà hàng không tồn tại'}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={16}
                                    className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <p className="text-sm text-gray-700">{review.content}</p>
                          {/* Review Images Preview in List */}
                          {review.images && review.images.length > 0 && (
                             <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                                {review.images.map((img, idx) => (
                                   <img key={idx} src={img} alt="review" className="w-20 h-20 object-cover rounded-lg border border-gray-100" />
                                ))}
                             </div>
                          )}
                          
                          <div className="flex gap-2 mt-3">
                            <button 
                                onClick={() => handleEditClick(review)}
                                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                            >
                              Sửa
                            </button>
                            <button 
                                onClick={() => handleDeleteReview(review._id)}
                                className="text-sm text-red-600 hover:text-red-700 font-semibold"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Gallery Tab */}
              {activeTab === 'gallery' && (
                <div className="animate-in fade-in duration-500">
                  {/* Gallery Stats / Filter Bar */}
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex gap-4 text-sm font-medium text-gray-500">
                      <span className="flex items-center gap-1">
                         <Grid size={16} /> {reviews.filter(r => r.images?.length > 0).length} bài viết
                      </span>
                      <span className="flex items-center gap-1">
                         <Heart size={16} /> {reviews.reduce((acc, r) => acc + (r.likes?.length || 0), 0)} lượt thích
                      </span>
                    </div>
                    {/* Optional: Add Filter/Sort here later */}
                  </div>

                  {reviews.length === 0 || !reviews.some(r => r.images && r.images.length > 0) ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                         <Camera size={32} className="text-orange-500" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-800">Chưa có ảnh nào</h4>
                      <p className="text-gray-500 mt-2 text-center max-w-md">
                        Hãy chia sẻ những trải nghiệm ẩm thực của bạn kèm theo hình ảnh để làm phong phú thư viện nhé!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-0.5 md:gap-1">
                      {/* Instagram Style Grid: 1 Post (Review) = 1 Square */}
                      {reviews.filter(r => r.images && r.images.length > 0).map((review) => (
                        <div 
                          key={review._id} 
                          className="relative aspect-square group cursor-pointer overflow-hidden bg-gray-100"
                          onClick={() => setSelectedReview(review)}
                        >
                          <img
                            src={review.images[0]}
                            alt={review.restaurant?.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          
                          {/* Multiple Images Indicator */}
                          {review.images.length > 1 && (
                            <div className="absolute top-2 right-2 text-white drop-shadow-md bg-black/20 rounded-full p-1 backdrop-blur-sm">
                              <Layers size={16} fill="currentColor" className="text-white" />
                            </div>
                          )}

                          {/* Hover Overlay - Premium Style */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-4 backdrop-blur-[2px]">
                            
                            {/* Likes & Comments */}
                            <div className="flex gap-6 text-white font-bold mb-2">
                                <div className="flex items-center gap-2">
                                    <Heart size={24} fill="white" />
                                    <span>{review.likes?.length || 0}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MessageSquare size={24} fill="white" />
                                    <span>{review.comments?.length || 0}</span>
                                </div>
                            </div>

                            {/* Restaurant Name (Optional enhancement) */}
                            <p className="text-white/90 text-xs font-medium mt-2 line-clamp-1 border-t border-white/30 pt-2 px-2">
                                {review.restaurant?.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Review Detail Modal (View Only) */}
              {selectedReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedReview(null)}>
                   {/* Close Button */}
                   <button 
                      className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50 p-2"
                      onClick={() => setSelectedReview(null)}
                   >
                     <X size={32} />
                   </button>
                   
                   <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl scale-100 animate-in zoom-in-95 duration-200 hide-scrollbar" onClick={e => e.stopPropagation()}>
                      <FeedReviewCard review={selectedReview} />
                   </div>
                </div>
              )}

              {/* Edit Review Modal */}
              {editingReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setEditingReview(null)}>
                  <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-xl text-gray-800">Chỉnh sửa đánh giá</h3>
                      <button onClick={() => setEditingReview(null)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                      </button>
                    </div>
                    
                    <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                      {/* Rating Input */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Đánh giá của bạn</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setEditingReview({ ...editingReview, rating: star })}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star 
                                size={32} 
                                className={`${star <= editingReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Content Input */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung</label>
                        <textarea
                          value={editingReview.content}
                          onChange={(e) => setEditingReview({ ...editingReview, content: e.target.value })}
                          className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 min-h-[120px] resize-none"
                          placeholder="Chia sẻ trải nghiệm của bạn..."
                          required
                        />
                      </div>

                      {/* Info Message (No Image Edit yet) */}
                      <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg flex items-start gap-2">
                         <Shield size={14} className="mt-0.5 text-blue-500 flex-shrink-0" />
                         Hiện tại chưa hỗ trợ chỉnh sửa hình ảnh. Vui lòng xóa và đăng lại nếu muốn thay đổi ảnh.
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingReview(null)}
                          className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
                        >
                          Lưu thay đổi
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* My Tours Tab */}
              {activeTab === 'tours' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Food Tour đã lưu</h3>
                  {foodTours.length === 0 ? (
                    <div className="text-center py-16">
                      <Map size={64} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-lg font-semibold text-gray-400">Bạn chưa lưu Food Tour nào</p>
                      <button
                        onClick={() => navigate('/food-tour')}
                        className="mt-4 px-6 py-2 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-colors"
                      >
                        Tạo Tour ngay
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {foodTours.map((tour) => (
                        <div 
                          key={tour._id} 
                          className="border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-orange-200 transition-all bg-white cursor-pointer group"
                          onClick={() => navigate(`/food-tour/${tour._id}`)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
                                {tour.name}
                              </h4>
                              <p className="text-sm text-gray-500 mb-3">{tour.description}</p>
                              <div className="flex gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <MapPin size={16} className="text-orange-500" />
                                  {tour.totalRestaurants} địa điểm
                                </span>
                                <span className="flex items-center gap-1">
                                  <Package size={16} className="text-blue-500" />
                                  {new Date(tour.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                              {/* Nút Xem/Sửa */}
                              <button 
                                onClick={() => navigate(`/food-tour/${tour._id}`)}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Xem/Chỉnh sửa tour"
                              >
                                <Edit size={20} />
                              </button>
                              {/* Nút Xóa */}
                              <button 
                                onClick={async () => {
                                  if(!window.confirm('Bạn có chắc muốn xóa tour này?')) return;
                                  try {
                                    const res = await api.delete(`/food-tours/${tour._id}`);
                                    if(res.success) {
                                      setFoodTours(foodTours.filter(t => t._id !== tour._id));
                                      setMessage('✅ Đã xóa tour');
                                      setTimeout(() => setMessage(''), 3000);
                                    }
                                  } catch(err) {
                                    console.error(err);
                                    setError('Lỗi khi xóa tour');
                                  }
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa tour"
                              >
                                <LogOut size={20} />
                              </button>
                            </div>
                          </div>
                          {/* Click hint */}
                          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight size={14} />
                            Click để xem và chỉnh sửa tour
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Cài đặt tài khoản</h3>
                  
                  {/* Profile Update Form */}
                  <form onSubmit={handleUpdateProfile} className="space-y-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tên hiển thị</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleFormChange}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={profile.email}
                          disabled
                          className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleFormChange}
                          placeholder="Nhập số điện thoại"
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleFormChange}
                          placeholder="Nhập địa chỉ"
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            name: user.name || '',
                            phone: user.phone || '',
                            address: user.address || ''
                          });
                        }}
                        className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </div>
                  </form>

                  {/* Password Change Section (Separate Form) */}
                  <div className="pt-8 border-t border-gray-200">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Shield size={20} className="text-orange-600" />
                      Đổi mật khẩu
                    </h4>
                    {user.provider === 'google' ? (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          Tài khoản Google không thể đổi mật khẩu tại đây. Vui lòng quản lý mật khẩu qua Google.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu hiện tại</label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            placeholder="Nhập mật khẩu hiện tại"
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu mới</label>
                            <input
                              type="password"
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Xác nhận mật khẩu</label>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              placeholder="Nhập lại mật khẩu mới"
                              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;