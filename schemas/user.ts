import { z } from "zod";

export const UserSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres"),
  username: z.string().min(2, "Gebruikersnaam moet minstens 2 karakters bevatten").max(50),
  password: z.string().min(6, "Wachtwoord moet minstens 6 karakters bevatten"),
});

export type UserInput = z.infer<typeof UserSchema>;
