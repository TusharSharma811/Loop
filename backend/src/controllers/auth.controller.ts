import type { Request, Response } from "express";
import prisma from "../lib/prismaClient.js";
import bcrypt from "bcryptjs"
import { generateJWT, generateRefreshJWT } from "../utils/generateJWT.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

class AuthController {

   private setAuthCookies = (res: Response, accesstoken: string, refreshToken: string) => {
    res.cookie("token", accesstoken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
  // 🟢 LOGIN
  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const accesstoken = generateJWT(user.id);
      const refreshToken = generateRefreshJWT(user.id);

      this.setAuthCookies(res, accesstoken, refreshToken);

      return res.status(200).json({
        message: "Login successful",
        user: { id: user.id, email: user.email },
      });
    } catch (error) {
      console.error("Error logging in", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // 🟢 REGISTER
  register = async (req: Request, res: Response) => {
    try {
      const { username, email, fullname, password } = req.body;

      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { username, fullname, email, passwordHash: hashedPassword },
      });

      const accesstoken = generateJWT(user.id);
      const refreshToken = generateRefreshJWT(user.id);

      this.setAuthCookies(res, accesstoken, refreshToken);

      return res.status(201).json({
        message: "User created successfully",
        user: { id: user.id, email: user.email, username: user.username },
      });
    } catch (error) {
      console.error("Error registering", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // 🟢 LOGOUT
  logout = (req: Request, res: Response) => {
    try {
      res.clearCookie("token");
      res.clearCookie("refreshToken");
      return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      console.error("Error logging out", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // 🟢 REFRESH TOKEN
  refreshToken = (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
      ) as { userId: string };

      const accesstoken = generateJWT(decoded.userId);
      const refreshTokenNew = generateRefreshJWT(decoded.userId);

      this.setAuthCookies(res, accesstoken, refreshTokenNew);

      return res
        .status(200)
        .json({ message: "Token refreshed successfully", valid: true });
    } catch (error) {
      console.error("Error refreshing token", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // 🟢 GOOGLE LOGIN (placeholder)
  googleLogin = (req: Request, res: Response) => {
    const googleOauthUrl = process.env.GOOGLE_OAUTH_URL ;
    const redirectUl = "http://localhost:3000/api/v1/auth/google-login/callback" ;
    const client_id = process.env.GOOGLE_OAUTH_CLIENT_ID ;
    const state = "someRandomState" ;
    const scopes = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events"
    ].join(" ");
    const authUrl = `${googleOauthUrl}?response_type=code&client_id=${client_id}&redirect_uri=${redirectUl}&scope=${scopes}&state=${state}&access_type=offline&prompt=consent`;
    return res.redirect(authUrl);
  }

  googleLoginCallback = async (req: Request, res: Response) => {
    try {
      const redirectUl = "http://localhost:3000/api/v1/auth/google-login/callback";
      const client_id = process.env.GOOGLE_OAUTH_CLIENT_ID;
      const client_secret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
      const state = "someRandomState";

    const { code, state: returnedState } = req.query;
    if (state !== returnedState) {
      return res.status(400).json({ message: "Invalid state parameter" });
    }
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", 
      {
        code,
        client_id: client_id,
        client_secret: client_secret,
        redirect_uri: redirectUl,
        grant_type: "authorization_code",
      },
    );
    const { access_token, refresh_token } = tokenRes.data;
    const profileRes = await axios.get("https://www.googleapis.com/oauth2/v1/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const { email, name, id: googleId, picture } = profileRes.data;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          fullname: name,
          username: email.split("@")[0],
          passwordHash: bcrypt.hashSync(googleId, 10),
          refreshToken: refresh_token,
          avatarUrl: picture,
        },
      });
    }
    const authToken = generateJWT(user.id);
    const refreshToken = generateRefreshJWT(user.id);
    this.setAuthCookies(res, authToken, refreshToken);
    return res.status(200).send(
      `
      <script>
        window.opener.postMessage({ 
          type: 'google-auth-success',
    }, '*');
        window.close();
      </script>
      <p>Authentication successful. You can close this window.</p>
      `
    )

    } catch (error) {
      console.error("Error during Google login callback", error);
      return res.status(500).json({ message: "Internal server error" });
    }
     
  }

  // 🟢 VERIFY
  verify = (req: Request, res: Response) => {
    return res.status(200).json({ valid: true });
  }

  

  // 🔒 UTILITY to set auth cookies
 
}

export default new AuthController();
