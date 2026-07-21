import jwt from 'jsonwebtoken'
import { User } from '../models/user_model.js';
import Restaurant from '../models/Restaurant.js';

export const isAuthenticated = async(req, res, next) =>{
    try {
        // console.log("Middleware Started");
        const authHeader = req.headers.authorization;
        // console.log("Headers:", req.headers);

        if(!authHeader || !authHeader.startsWith('Bearer')){
            return res.status(401).json({
                success:false,
                message:'Please Login'
            })
        }

        const token = authHeader.split(" ")[1]

        jwt.verify(token, process.env.SECRET_KEY, async (err, decoded)=>{
            if(err){
                if(err.name === "TokenExpiredError"){
                    return res.status(400).json({
                        success:false,
                        message:"Please Login"
                    })
                }
                return res.status(400).json({
                    success:false,
                    message:"Please Login"
                })
            }

            const { id, role } = decoded;
            let user;

            if (role === 'restaurant') {
                user = await Restaurant.findById(id);
            } else {
                user = await User.findById(id);
            }

            if(!user){
                return res.status(404).json({
                    success:false,
                    message: role === 'restaurant' ? 'Restaurant not found' : 'User not found'
                })
            }

            req.user = user
            req.userId = user._id
            req.userRole = role
            next()
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


