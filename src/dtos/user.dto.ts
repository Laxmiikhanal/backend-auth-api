import { z } from "zod";

// ✅ helper: trims strings BEFORE validating
const TrimmedString = (min: number, message: string) =>
  z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z.string().min(min, message)
  );

// ✅ email: trim + lowercase + remove all spaces BEFORE email validation
const EmailSchema = z.preprocess(
  (val) => {
    if (typeof val !== "string") return val;
    return val.trim().toLowerCase().replace(/\s+/g, "");
  },
  z.string().email("Valid email is required")
);

export const CreateUserDto = z.object({
  firstName: TrimmedString(1, "First name is required"),
  lastName: TrimmedString(1, "Last name is required"),
  email: EmailSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),

  imageUrl: z.string().optional(),
  role: z.enum(["user", "admin"]).optional(),
});

export const LoginUserDto = z.object({
  email: EmailSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const UpdateUserDto = z.object({
  firstName: TrimmedString(1, "Invalid firstName").optional(),
  lastName: TrimmedString(1, "Invalid lastName").optional(),
  email: EmailSchema.optional(),
  password: z.string().min(6).optional(),

  imageUrl: z.string().optional(),
  role: z.enum(["user", "admin"]).optional(),
});
