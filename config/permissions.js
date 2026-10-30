// Role-based access control for AAV Dairy Farm.
//
// Rule of thumb:
//   - Any logged-in user can READ (GET) data, so shared pages like Animal Details
//     and Dashboard never break for Doctor / Caretaker.
//   - CREATE / UPDATE depend on the role's job (matrix below).
//   - DELETE is Administrator-only everywhere.
//
// Keep this file in sync with the frontend copy: src/utils/permissions.js

const ROLES = {
  ADMIN: "Administrator",
  DOCTOR: "Doctor",
  CARETAKER: "Caretaker",
};

// Staff roles only — customers never get farm-module permissions.
const ALL_ROLES = Object.values(ROLES);

// Online-store customers (role value exactly "customer").
const CUSTOMER_ROLE = "customer";

// Roles a person may pick on the public Register page.
// "Administrator" is only accepted when no Administrator exists yet (first setup).
const SELF_REGISTER_ROLES = [ROLES.DOCTOR, ROLES.CARETAKER];

const { ADMIN, DOCTOR, CARETAKER } = ROLES;

const PERMISSIONS = {
  //               create                       update                       remove
  animals:     { create: [ADMIN, CARETAKER],         update: [ADMIN, CARETAKER, DOCTOR], remove: [ADMIN] },
  breeding:    { create: [ADMIN, DOCTOR, CARETAKER], update: [ADMIN, DOCTOR],            remove: [ADMIN] },
  calves:      { create: [ADMIN, CARETAKER],         update: [ADMIN, CARETAKER, DOCTOR], remove: [ADMIN] },
  medical:     { create: [ADMIN, DOCTOR],            update: [ADMIN, DOCTOR],            remove: [ADMIN] },
  vaccination: { create: [ADMIN, DOCTOR],            update: [ADMIN, DOCTOR],            remove: [ADMIN] },
  milk:        { create: [ADMIN, CARETAKER],         update: [ADMIN, CARETAKER],         remove: [ADMIN] },
  feed:        { create: [ADMIN, CARETAKER],         update: [ADMIN, CARETAKER],         remove: [ADMIN] },
  breeds:      { create: [ADMIN],                    update: [ADMIN],                    remove: [ADMIN] },
  diseases:    { create: [ADMIN, DOCTOR],            update: [ADMIN, DOCTOR],            remove: [ADMIN] },
  medicines:   { create: [ADMIN, DOCTOR],            update: [ADMIN, DOCTOR],            remove: [ADMIN], dispense: [ADMIN, DOCTOR] },
  suppliers:   { create: [ADMIN],                    update: [ADMIN],                    remove: [ADMIN] },
};

const can = (role, module, action) => {
  if (!role) return false;
  if (action === "view") return ALL_ROLES.includes(role);
  const allowed = PERMISSIONS[module]?.[action];
  return Array.isArray(allowed) && allowed.includes(role);
};

module.exports = { ROLES, ALL_ROLES, CUSTOMER_ROLE, SELF_REGISTER_ROLES, PERMISSIONS, can };