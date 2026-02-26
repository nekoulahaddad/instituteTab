export const UserRoles = ["STUDENT", "TEACHER", "ADMIN"] as const;
export type UserRole = (typeof UserRoles)[number];

export const UserStatuses = ["PENDING", "ACTIVE", "SUSPENDED"] as const;
export type UserStatus = (typeof UserStatuses)[number];

export const Languages = ["en", "ar"] as const;
export type Language = (typeof Languages)[number];

export const Levels = ["beginner", "intermediate", "advanced"] as const;
export type Level = (typeof Levels)[number];

export const Branches = [
  { id: "b1", name: "Main Branch" },
  { id: "b2", name: "Branch B" },
];

export type Branch = (typeof Branches)[number];
