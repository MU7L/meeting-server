import jwt from "jsonwebtoken";
import { secret } from "../config";

const tokenController = {
    sign(id: number) {
        return {
            token: jwt.sign(
                {id},
                secret,
                {expiresIn: "1h"}
            ),
            refreshToken: jwt.sign(
                {id},
                secret,
                {expiresIn: "1d"}
            )
        };
    },
    update() {

    }
}

export default tokenController;
