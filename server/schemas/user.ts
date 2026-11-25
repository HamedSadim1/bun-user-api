import { z } from "zod";
import { VALIDATION } from "../../shared/config";

export const UserSchema = z.object({
  email: z.email({ message: VALIDATION.email.apiInvalid }),
  username: z
    .string()
    .min(VALIDATION.username.min, { message: VALIDATION.username.minMessage })
    .max(VALIDATION.username.max, { message: VALIDATION.username.maxMessage }),
  password: z.string().min(VALIDATION.password.min, { message: VALIDATION.password.minMessage }),
});
