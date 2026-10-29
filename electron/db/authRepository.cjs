const userRepository = require('./userRepo.cjs');


// =====================================================
// LOGIN USER
// =====================================================

function loginUser(userId, pin) {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User is required.',
      };
    }

    if (pin === undefined || pin === null || pin === '') {
      return {
        success: false,
        error: 'PIN is required.',
      };
    }

    const user =
      userRepository.getUserForLogin(userId);

    if (!user) {
      return {
        success: false,
        error: 'User not found.',
      };
    }


    // =================================================
    // ACTIVE CHECK
    // =================================================

    if (Number(user.isActive) !== 1) {
      return {
        success: false,
        error: 'This user is inactive.',
      };
    }


    // =================================================
    // POS LOGIN CHECK
    // =================================================

    if (Number(user.allowPosLogin) !== 1) {
      return {
        success: false,
        error: 'POS login is not allowed for this user.',
      };
    }


    // =================================================
    // SIMPLE PIN CHECK
    // =================================================

    if (String(user.loginPin) !== String(pin)) {
      return {
        success: false,
        error: 'Invalid PIN.',
      };
    }


    // =================================================
    // SAFE USER
    // =================================================
    //
    // Never return loginPin to renderer.
    //

    return {
      success: true,

      user: {
        userId: user.userId,
        outletId: user.outletId,
        fullName: user.fullName,
        username: user.username,
        mobile: user.mobile,
        employeeId: user.employeeId,
        role: user.role,
      },
    };

  } catch (error) {
    console.error('loginUser error:', error);

    return {
      success: false,
      error: error.message || 'Login failed.',
    };
  }
}


module.exports = {
  loginUser,
};