import { mockUsers, userRoles } from "../../../mocks/mockData";
import { modulesService } from "../../../shared/services/modulesService";

const cloneUser = (user) => ({
  ...user,
  permissions: [...user.permissions],
});

export const usersService = {
  listUsers: () => mockUsers.map(cloneUser),
  listRoles: () => userRoles.map((role) => ({ ...role })),
  listModules: () => modulesService.listModules(),
};
