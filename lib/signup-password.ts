export const SIGNUP_PASSWORD_MIN_LENGTH = 8;
export const SIGNUP_PASSWORD_MAX_LENGTH = 128;

export type PasswordStrength = {
  label: "Weak" | "Fair" | "Good" | "Strong";
  percent: 25 | 50 | 75 | 100;
  barClassName: string;
  textClassName: string;
};

export function getPasswordStrength(password: string): PasswordStrength {
  const characterTypes = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  if (password.length < SIGNUP_PASSWORD_MIN_LENGTH || characterTypes <= 1) {
    return {
      label: "Weak",
      percent: 25,
      barClassName: "bg-red-500",
      textClassName: "text-red-600",
    };
  }

  if (characterTypes === 2) {
    return {
      label: "Fair",
      percent: 50,
      barClassName: "bg-amber-500",
      textClassName: "text-amber-600",
    };
  }

  if (characterTypes === 3 && password.length < 12) {
    return {
      label: "Good",
      percent: 75,
      barClassName: "bg-blue-500",
      textClassName: "text-blue-600",
    };
  }

  return {
    label: "Strong",
    percent: 100,
    barClassName: "bg-green-500",
    textClassName: "text-green-600",
  };
}
