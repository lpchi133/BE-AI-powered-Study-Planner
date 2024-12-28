import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { config } from "dotenv";
import { AuthService } from "../auth.service";
import * as bcrypt from "bcrypt";

config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["email", "profile"],
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails } = profile;
    const hashedPassword = await bcrypt.hash(id, 10);
    const user = await this.authService.validateUserGoogle({
      email: emails[0].value,
      name: `${name.givenName} ${name.familyName}`,
      password: hashedPassword,
      checkAccountGG: true,
    });

    done(null, user);
  }
}
