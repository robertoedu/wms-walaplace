import { userRoles } from "../../../mocks/mockData.js";
import { usersMockRepository } from "../../../mocks/usersMockRepository.js";
import { modulesService } from "../../../shared/services/modulesService.js";

const cloneUser = (user) => ({
  ...user,
  permissions: [...user.permissions],
});

export const usersService = {
  listUsers: () => usersMockRepository.listUsers().map(cloneUser),
  listRoles: () => userRoles.map((role) => ({ ...role })),
  listModules: () => modulesService.listModules(),
  saveUser: (user) => cloneUser(usersMockRepository.saveUser(user)),
};
