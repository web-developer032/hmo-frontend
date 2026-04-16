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

export type LoginFormValues = yup.InferType<typeof loginSchema>;
export type RegisterFormValues = yup.InferType<typeof registerSchema>;
