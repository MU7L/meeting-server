// 验证码控制器
import { captchaExpireTime } from "../config";

const captchaController = {
    map: new Map<string, { id: number; captcha: string }>(),
    generate(): string {
        // 生成5个字符的验证码，由大写字母和数字组成
        return Array(5)
            .fill(0)
            .map(() => String.fromCharCode(Math.floor(Math.random() * 10) + 65))
            .join("");
    },
    set(email: string, id: number, captcha: string) {
        this.map.set(email, {id, captcha});
        setTimeout(() => {
            this.map.delete(email);
        }, captchaExpireTime);
    },
    examine(email: string, captcha: string): boolean {
        const res = this.map.get(email);
        if (!res) return false;
        if (captcha !== res.captcha) return false;
        this.map.delete(email);
        return true;
    }
};

export default captchaController;
