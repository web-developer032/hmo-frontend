import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

export const registerSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name is too long")
    .required("Name is required"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .required("Confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
  roleLandlord: yup
    .boolean()
    .defined()
    .test(
      "at-least-one-role",
      "Select at least one role: Landlord and/or Tenant.",
      function (v) {
        return v === true || this.parent.roleTenant === true;
      },
    ),
  roleTenant: yup.boolean().defined(),
});

export const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
});

export const resetPasswordSchema = yup.object({
  token: yup
    .string()
    .trim()
    .length(64, "Reset link looks invalid — use the link from your email")
    .required("Reset token is required"),
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .required("Confirm your password")
    .oneOf([yup.ref("newPassword")], "Passwords must match"),
});

export const updatePasswordSchema = yup.object({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
    .required("New password is required")
    .test(
      "differs-from-current",
      "New password must differ from your current password",
      function (value) {
        const current = this.parent.currentPassword as string | undefined;
        if (!value || current === undefined || current === "") return true;
        return value !== current;
      },
    ),
  confirmPassword: yup
    .string()
    .required("Confirm your password")
    .oneOf([yup.ref("newPassword")], "Passwords must match"),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;
export type RegisterFormValues = yup.InferType<typeof registerSchema>;
export type ForgotPasswordFormValues = yup.InferType<
  typeof forgotPasswordSchema
>;
export type ResetPasswordFormValues = yup.InferType<
  typeof resetPasswordSchema
>;
export type UpdatePasswordFormValues = yup.InferType<
  typeof updatePasswordSchema
>;
