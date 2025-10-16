const express = require('express');
const passport = require('passport');
const { generateToken } = require('../config/auth');
const User = require('../models/User');

const router = express.Router();

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth
 *     description: Start the Google OAuth authentication process
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     description: Handle the callback from Google OAuth
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       401:
 *         description: Authentication failed
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Logout the current user (client-side token removal)
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 */

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh JWT token
 *     description: Generate a new JWT token using the existing token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Invalid token
 */

// Initiate Google OAuth
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Find or create user in database
      const user = await User.findOrCreate(req.user);

      // Generate JWT token
      const token = generateToken(user);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // In a real application, you might redirect to frontend with token
      // For now, we'll return the token and user info
      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          role: user.role
        }
      });
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  }
);

// Logout (client-side should remove token)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    // In a real implementation, you would verify the current token
    // and generate a new one
    res.status(501).json({
      success: false,
      error: 'Token refresh not implemented'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    // This would require authentication middleware in a real implementation
    res.status(501).json({
      success: false,
      error: 'Profile endpoint requires authentication'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
