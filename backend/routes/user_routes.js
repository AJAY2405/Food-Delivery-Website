import express from "express"
import { changePassword, forgotPassword, getCurrentUser, loginUser, logoutUser, registerUser, updateProfile, verification, verifyOTP } from "../controller/userController.js"
import { isAuthenticated } from "../middlewires/isAuthenticated.js"
import { userSchema, validateUser } from "../validators/userValidate.js"
import { singleUpload } from "../middlewires/multer.js"
import addressRoutes from "./addressRoutes.js"

const router = express.Router()


router.post('/register',validateUser(userSchema), registerUser)
router.post('/verify', verification)
router.post('/login', loginUser)
router.post('/logout',isAuthenticated, logoutUser)

router.get("/me", isAuthenticated, getCurrentUser);

router.put('/profile/update',isAuthenticated,singleUpload,updateProfile)
router.post('/forgot-password', forgotPassword)
router.post('/verify-otp/:email', verifyOTP)
router.post('/change-password/:email', changePassword)

router.use('/address', addressRoutes)


// router.get("/me", isAuthenticated, getMe);


export default router


