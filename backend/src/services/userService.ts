import User from '../models/user'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import config from '../utils/config'
import { UserInfo } from '../types'

const createUser = async ( userInfo: UserInfo ) => {
    const { name, username, password } = userInfo
    const user = await User.findOne({ username })
    if (user) {
      throw Error('User already exists')
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const newUser = new User({
        name,
        username,
        passwordHash,
    })

    return await newUser.save()
}

const login = async ( userInfo: UserInfo ) => {
    const { username, password } = userInfo
    const user = await User.findOne({ username })
    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.passwordHash)

    if (!(user && passwordCorrect)) {
      throw Error('invalid username or password')
    }

    const userForToken = {
        username: user.username,
        id: user._id,
    }

    const token = jwt.sign(userForToken, config.JWT_SECRET)

    return { token, username: user.username, name: user.name }
}

export default {
  login,
  createUser
};