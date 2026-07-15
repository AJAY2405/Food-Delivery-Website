// middlewires/checkRole.js
import { User } from "../models/user_model.js";

export const checkRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId).select("role");

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `This action requires role: ${allowedRoles.join(" or ")}`,
        });
      }

      req.userRole = user.role;
      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
};
