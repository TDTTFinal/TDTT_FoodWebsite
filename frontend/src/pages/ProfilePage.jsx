import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Heart, Star, Settings, Camera, LogOut, ChevronRight, MapPin, Package, Shield, Map, Mail, Phone, Calendar, MessageSquare, ArrowLeft, Edit, Grid, Bookmark, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RestaurantCard from '../components/RestaurantCard';
import api from '../config/api';

const ProfilePage = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState('info'); // 'info' now represents the 'Posts/Grid' view
  const [profile, setProfile] = useState(null);
  const [foodTours, setFoodTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

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
          reviews: mockReviews.length
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
      fetchTours();
    }
  }, [user, user?.avatar]);

  // Avatar upload handlers
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File quá lớn! Tối đa 5MB.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Chỉ chấp nhận file ảnh!');
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setProfile({ ...profile, avatar_url: previewUrl });
      handleUploadAvatar(file);
    }
  };

  const handleUploadAvatar = async (file) => {
    setUploading(true);
    setError('');
    setMessage('');
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('avatar', file);
      const response = await api.post('/users/upload-avatar', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.success) {
        setMessage('✅ Cập nhật ảnh đại diện thành công!');
        setProfile({ ...profile, avatar_url: response.url });
        updateUser({ avatar: response.url });
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(response.message || 'Upload thất bại');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await api.put('/users/profile', formData);
      if (response.success) {
        setMessage('✅ Cập nhật thông tin thành công!');
        setProfile({ ...profile, ...formData });
        updateUser(formData);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(response.message || 'Cập nhật thất bại');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
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
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(response.message || 'Đổi mật khẩu thất bại');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Modal Component for Edit Profile
  const EditProfileModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold">Chỉnh sửa trang cá nhân</h3>
          <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
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
                  onClick={() => setShowEditModal(false)}
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
                    className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
                  >
                    {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                  </button>
                </form>
              )}
            </div>
            
             <div className="mt-8 pt-8 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-3 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors font-bold"
                >
                  <LogOut size={18} />
                  Đăng xuất
                </button>
             </div>
        </div>
      </div>
    </div>
  );

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-96">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* === HEADER SECTION === */}
        <header className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-12 px-4 md:px-12">
            {/* Avatar */}
            <div className="shrink-0 relative group mx-auto md:mx-0">
               <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-orange-500 to-purple-600">
                  <div className="w-full h-full rounded-full p-[2px] bg-white">
                    <img
                        src={profile.avatar_url}
                        alt={profile.name}
                        className="w-full h-full rounded-full object-cover"
                    />
                  </div>
               </div>
               {/* Upload Button Overlay */}
               <label 
                 htmlFor="avatar-upload"
                 className="absolute inset-0 flex items-center justify-center bg-black/30 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
               >
                 <Camera size={24} />
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

            {/* Info */}
            <div className="flex-1 flex flex-col gap-4 w-full">
                {/* Row 1: Name + Edit Button */}
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <h1 className="text-2xl font-light text-gray-800">{profile.name}</h1>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowEditModal(true)}
                            className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 font-semibold rounded-lg text-sm text-gray-800 transition-colors"
                        >
                            Chỉnh sửa trang cá nhân
                        </button>
                        <button 
                            onClick={() => setShowEditModal(true)}
                            className="p-2 text-gray-800 hover:bg-gray-100 rounded-full"
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                </div>

                {/* Row 2: Stats */}
                <div className="flex justify-center md:justify-start gap-8 text-base">
                    <div className="text-center md:text-left">
                        <span className="font-bold text-gray-900">{profile.stats.reviews}</span> bài viết
                    </div>
                    <div className="text-center md:text-left">
                        <span className="font-bold text-gray-900">{foodTours.length}</span> food tour
                    </div>
                    <div className="text-center md:text-left">
                        <span className="font-bold text-gray-900">{profile.stats.favorites}</span> đã lưu
                    </div>
                </div>

                {/* Row 3: Bio */}
                <div className="text-center md:text-left text-sm">
                    <p className="font-bold text-gray-900">{profile.name}</p>
                    <p className="text-gray-600 whitespace-pre-line">
                        {profile.address ? `📍 ${profile.address}` : ''}
                        {profile.phone ? `\n📞 ${profile.phone}` : ''}
                        {(!profile.address && !profile.phone) && 'Chưa có thông tin giới thiệu.'}
                    </p>
                </div>
            </div>
        </header>

        {/* === MESSAGES === */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg animate-in fade-in flex items-center justify-center">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg animate-in fade-in flex items-center justify-center">
            {error}
          </div>
        )}

        {/* === TABS === */}
        <div className="border-t border-gray-200 mb-4">
            <div className="flex justify-center gap-12">
                <button
                    onClick={() => setActiveTab('info')}
                    className={`flex items-center gap-2 py-4 border-t-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                        activeTab === 'info' || activeTab === 'reviews' 
                            ? 'border-gray-800 text-gray-800' 
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <Grid size={12} /> <span className="hidden md:inline">Bài viết</span>
                </button>
                <button
                    onClick={() => setActiveTab('favorites')}
                    className={`flex items-center gap-2 py-4 border-t-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                        activeTab === 'favorites' 
                            ? 'border-gray-800 text-gray-800' 
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <Bookmark size={12} /> <span className="hidden md:inline">Đã lưu</span>
                </button>
                <button
                    onClick={() => setActiveTab('tours')}
                    className={`flex items-center gap-2 py-4 border-t-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                        activeTab === 'tours' 
                            ? 'border-gray-800 text-gray-800' 
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <MapPin size={12} /> <span className="hidden md:inline">Food Tours</span>
                </button>
            </div>
        </div>

        {/* === CONTENT GRID === */}
        <div className="min-h-[300px]">
            {/* POSTS / REVIEWS GRID */}
            {(activeTab === 'info' || activeTab === 'reviews') && (
                <div className="grid grid-cols-3 gap-1 md:gap-8">
                     {mockReviews.length === 0 ? (
                        <div className="col-span-3 py-10 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full border-2 border-gray-800 flex items-center justify-center mb-4">
                                <Camera size={32} className="text-gray-800"/>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Chia sẻ ảnh quán ăn của bạn</h2>
                            <p className="text-sm text-gray-500 mt-2 mb-4">Khi bạn viết đánh giá có ảnh, chúng sẽ xuất hiện ở đây.</p>
                            <button className="text-blue-500 font-semibold hover:text-blue-600">Viết đánh giá đầu tiên</button>
                        </div>
                     ) : (
                         mockReviews.map((review) => (
                             <div key={review.id} className="relative aspect-square group cursor-pointer bg-gray-100 overflow-hidden">
                                <img
                                    src={review.restaurant.avatar_url || 'https://placehold.co/400'}
                                    alt="Post"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <Heart fill="white" size={20} /> {review.rating}
                                    </div>
                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <MessageSquare fill="white" size={20} /> 2
                                    </div>
                                </div>
                             </div>
                         ))
                     )}
                </div>
            )}

            {/* FAVORITES GRID */}
            {activeTab === 'favorites' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockFavorites.length === 0 ? (
                        <div className="col-span-3 py-20 text-center">
                            <p className="text-gray-500">Chưa lưu quán ăn nào.</p>
                             <button
                                onClick={() => navigate('/search')}
                                className="mt-4 text-blue-500 font-semibold"
                              >
                                Tìm quán ngon ngay
                              </button>
                        </div>
                    ) : (
                         // Need a compact RestaurantCard or similar. Using placeholder.
                        <div className="border rounded-lg p-4">Favorite Item</div>
                    )}
                </div>
            )}

             {/* TOURS GRID */}
             {activeTab === 'tours' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {foodTours.length === 0 ? (
                        <div className="col-span-3 py-20 text-center">
                             <div className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center mb-6 mx-auto bg-gray-50">
                                <Map size={40} className="text-gray-400"/>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Tạo Food Tour của riêng bạn</h2>
                            <p className="text-gray-500 mt-2">Lưu lại lộ trình ăn uống và chia sẻ với bạn bè.</p>
                             <button
                                onClick={() => navigate('/food-tour')}
                                className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
                              >
                                Tạo Tour Mới
                              </button>
                        </div>
                    ) : (
                         foodTours.map((tour) => (
                            <div 
                                key={tour._id} 
                                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer group bg-white"
                                onClick={() => navigate(`/food-tour/${tour._id}`)}
                            >
                                <div className="h-40 bg-gray-100 flex items-center justify-center relative">
                                     <Map className="text-gray-300" size={48} />
                                     <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                        {tour.totalRestaurants} địa điểm
                                     </div>
                                </div>
                                <div className="p-4">
                                     <h4 className="font-bold text-gray-800 truncate group-hover:text-amber-600">{tour.name}</h4>
                                     <p className="text-xs text-gray-500 mt-1 line-clamp-2">{tour.description || 'Không có mô tả'}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

        </div>
      </main>

      {/* MODAL */}
      {showEditModal && <EditProfileModal />}

      <Footer />
    </div>
  );
};

export default ProfilePage;