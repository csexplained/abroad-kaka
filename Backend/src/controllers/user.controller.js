import { asyncHandeler } from "../utils/asynchandeler.js";
import { ApiError } from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import { deletefromcloudinary, videodeletefromcloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from '../utils/apiresponse.js'
import jwt from "jsonwebtoken"

const genrateAccessandRefreshtokens = async (userid) => {
    try {
        const user = await User.findById(userid)
        const accessToken = user.genrateAccessToken()
        const refreshToken = user.genrateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, "Something Want Wrong While Genrateing refreash tokens"))
    }
}

const registerUser = asyncHandeler(async (req, res) => {

    const { username, fullname, email, password } = req.body
    if ([fullname, username, email, password].some((field) => field?.trim() === "")) {
        return res
            .status(400)
            .json(new ApiError(400, {}, "All Fields Are Required"))
    }
    // await here
    const exitedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (exitedUser) {
        return res
            .status(409)
            .json(new ApiError(409, {}, 'User with Email or Username already exists'))
    }

    const user = await User.create({
        fullname,
        email,
        password,
        username: username.toLowerCase()
    })


    const { accessToken, refreshToken } = await genrateAccessandRefreshtokens(user._id)


    const createdUser = await User.findById(user._id).select(
        // kya kya nhi chahiye - sign k sath do yha
        "-password -refreshToken -watchHistory"
    )
    if (!createdUser) {
        return res
            .status(500)
            .json(new ApiError(500, {}, "Something went Wrong while registering User"))
    }


    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: createdUser, refreshToken
                },
                "User logged In SuccessFully"
            )
        )

})



const loginUser = asyncHandeler(async (req, res) => {
    // get data from req.body
    // username or email
    // find the user in db
    // check password 
    // if password wrong send wrong 
    // if right gen access or refreash token's
    // send this token in cookis with secure cookies
    //  
    const { email, username, password } = req.body

    if (!username && !email) {
        return res
            .status(400)
            .json(new ApiError(400, {}, "Username Or Email is Required"));
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        return res
            .status(400)
            .json(new ApiError(404, {}, "User Does Not Exist"));

    }

    const ispasswordvaild = await user.isPasswordCorrect(password)

    if (!ispasswordvaild) {
        return res
            .status(400)
            .json(new ApiError(400, {}, "Invaild User Creadetials"));
    }

    const { accessToken, refreshToken } = await genrateAccessandRefreshtokens(user._id)

    const loggedinuser = await User.findById(user._id).select(
        "-password -refreshToken -watchHistory"
    )

    const options = {
        httpOnly: true,
        secure: true, // Ensure secure is true for SameSite=None cookies
        sameSite: 'None', // Ensure cross-origin cookies work
        maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedinuser, accessToken, refreshToken
                },
                "User logged In SuccessFully"
            )
        )

})

// for logout
// delete cookies or reset refreash token
// 

const logoutUser = asyncHandeler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        })

    const options = {
        httpOnly: true,
        secure: true, // Ensure secure is true for SameSite=None cookies
        sameSite: 'None', // Ensure cross-origin cookies work
        maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    }

    return res.status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out"))
})

const refreshAccessToken = asyncHandeler(async (req, res) => {

    const incomingrefreshtoken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingrefreshtoken) {
        return res
            .status(401)
            .json(new ApiError(401, {}, "UnAuthorized Request"));
    }

    try {
        // console.log(incomingrefreshtoken);
        const decodedToken = jwt.verify(incomingrefreshtoken, process.env.REFRESH_TOKEN_SECRET)
        if (!decodedToken) return res.status(401).json(new ApiError(401, {}, "Something Wrong Happend"))
        const user = await User.findById(decodedToken?._id).select("-password -accessToken -watchHistory")

        if (!user) {
            throw new ApiError(401, {}, "Invaild Refresh token")
        }

        if (incomingrefreshtoken !== user?.refreshToken) {
            throw new ApiError(401, {}, "Refresh Token is expriys or used")
        }

        const options = {
            httpOnly: true,
            secure: true, // Ensure secure is true for SameSite=None cookies
            sameSite: 'None', // Ensure cross-origin cookies work
            maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
        }

        const { accessToken, refreshToken } = await genrateAccessandRefreshtokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,

                    { data: user, refreshToken }
                    ,
                    "Token Refreshed Successfully"
                )
            )
    } catch (error) {
        // console.log(error)
        return res
            .status(401)
            .json(new ApiError(401, {}, "Invaild Refresh Token"));
    }
})

const changeCurrentPassword = asyncHandeler(async (req, res) => {
    const { oldPassword, NewPassword } = req.body

    if (!NewPassword) {
        return res
            .status(301)
            .json(new ApiError(301, {}, "Pls Provide New Password"));
    }
    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        return res
            .status(400)
            .json(new ApiError(400, {}, "Invaild old Password"));

    }

    user.password = NewPassword

    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Changed Successfully"))
})

const getCurrentUser = asyncHandeler(async (req, res) => {
    return res.status(200)
        .json(new ApiResponse(200, req.user, "Current User Fatced Success"))
})

const updateAccountDetails = asyncHandeler(async (req, res) => {

    const { fullname, email } = req.body

    if (!fullname || !email) {
        return res
            .status(300)
            .json(new ApiError(300, {}, "All fields are req"));
    }

    if (req.user.email !== email) {
        const exitedUser = await User.findOne({ email })
        if (exitedUser) {
            return res
                .status(301)
                .json(new ApiError(301, {}, "Email Already Existed"));
        }
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            fullname,
            email,
        }
    }, { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account Details Updated Successfully"))
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
}