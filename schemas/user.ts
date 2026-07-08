import { z } from "zod";

export const UserSchema = z.object({
  email: z.email({ message: "Ongeldig e-mailadres" }),
  username: z
    .string()
    .min(2, { message: "Gebruikersnaam moet minstens 2 karakters bevatten" })
    .max(50, { message: "Gebruikersnaam mag maximaal 50 karakters bevatten" }),
  password: z.string().min(6, { message: "Wachtwoord moet minstens 6 karakters bevatten" }),
});

export type UserInput = z.infer<typeof UserSchema>;
