const express = require('express');
const { upload } = require('../middleware/uploadMiddleware');
const cloudinary = require('../config/cloudinary');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/users/upload-avatar
router.post('/upload-avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    // Kiểm tra file
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Không có file nào được tải lên' 
      });
    }

    console.log('Uploading avatar for user:', req.user._id);

    // Upload lên Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'food_website/avatars',
          transformation: [
            { width: 300, height: 300, crop: 'fill', gravity: 'face' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ],
          public_id: `avatar_${req.user._id}`,
          overwrite: true
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload success:', result.secure_url);
            resolve(result);
          }
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Cập nhật URL vào database
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    ).select('-passwordHash');

    res.json({
      success: true,
      message: 'Upload ảnh thành công!',
      url: result.secure_url,
      user: updatedUser
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi upload ảnh'
    });
  }
});

// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin người dùng'
    });
  }
});

// PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        name: name || req.user.name,
        phone,
        address
      },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công!',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật thông tin'
    });
  }
});

// POST /api/users/change-password
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Check if user has password (not OAuth user)
    if (user.provider === 'google') {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản Google không thể đổi mật khẩu'
      });
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.passwordHash = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công!'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi đổi mật khẩu'
    });
  }
});

// GET /api/users
router.get('/', protect, async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    // Find users excluding the current user
    const users = await User.find({ ...keyword, _id: { $ne: req.user._id } })
      .select("-passwordHash")
      .limit(20);

    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách người dùng'
    });
  }
});

// -----------------------------------------------------------------------------
// FRIEND SYSTEM API
// -----------------------------------------------------------------------------

// POST /api/users/friend-request/:id
router.post('/friend-request/:id', protect, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ success: false, message: "Không thể kết bạn với chính mình" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    }

    // Check if already friends
    if (currentUser.friends.includes(targetUserId)) {
      return res.status(400).json({ success: false, message: "Đã là bạn bè rồi" });
    }

    // Check if request already sent
    if (currentUser.sentFriendRequests.includes(targetUserId)) {
      return res.status(400).json({ success: false, message: "Đã gửi lời mời trước đó" });
    }

    // Check if request received (so should accept instead)
    if (currentUser.friendRequests.includes(targetUserId)) {
      return res.status(400).json({ success: false, message: "Người này đã gửi lời mời cho bạn, hãy chấp nhận nhé" });
    }

    // Update arrays
    currentUser.sentFriendRequests.push(targetUserId);
    targetUser.friendRequests.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.json({ success: true, message: "Đã gửi lời mời kết bạn" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// POST /api/users/friend-accept/:id
router.post('/friend-accept/:id', protect, async (req, res) => {
  try {
    const requesterId = req.params.id;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    const requester = await User.findById(requesterId);

    if (!currentUser || !requester) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    }

    if (!currentUser.friendRequests.includes(requesterId)) {
      return res.status(400).json({ success: false, message: "Không tìm thấy lời mời kết bạn" });
    }

    // Add to friends list
    currentUser.friends.push(requesterId);
    requester.friends.push(currentUserId);

    // Remove from requests
    currentUser.friendRequests = currentUser.friendRequests.filter(id => id.toString() !== requesterId);
    requester.sentFriendRequests = requester.sentFriendRequests.filter(id => id.toString() !== currentUserId.toString());

    await currentUser.save();
    await requester.save();

    res.json({ success: true, message: "Đã chấp nhận kết bạn" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// POST /api/users/friend-reject/:id
router.post('/friend-reject/:id', protect, async (req, res) => {
  try {
    const requesterId = req.params.id;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    const requester = await User.findById(requesterId); // Need to update sender's sent list too

    if (currentUser && currentUser.friendRequests.includes(requesterId)) {
        currentUser.friendRequests = currentUser.friendRequests.filter(id => id.toString() !== requesterId);
        await currentUser.save();
    }
    
    if(requester && requester.sentFriendRequests.includes(currentUserId)){
        requester.sentFriendRequests = requester.sentFriendRequests.filter(id => id.toString() !== currentUserId.toString());
        await requester.save();
    }

    res.json({ success: true, message: "Đã từ chối lời mời" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// GET /api/users/friends (My Friends)
router.get('/friends', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('friends', 'name email avatar');
        res.json({ success: true, friends: user.friends });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
});

// GET /api/users/requests (Incoming Requests)
router.get('/friend-requests', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('friendRequests', 'name email avatar');
        res.json({ success: true, requests: user.friendRequests });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
});

module.exports = router;

