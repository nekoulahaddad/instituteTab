export const UserRoles = ["student", "teacher", "employee"] as const;
export type UserRole = (typeof UserRoles)[number];

export const UserStatuses = ["pending", "approved", "canceled"] as const;
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
