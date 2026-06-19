import { usersMockRepository } from "../../mocks/usersMockRepository.js";

const withoutPassword = (user) => {
  const { password, ...safeUser } = user;
  void password;
  return safeUser;
};

export const authService = {
  login: (username, password) => {
    const foundUser = usersMockRepository.findByCredentials(username, password);

    if (!foundUser) {
      return { success: false, message: "Usuário ou senha inválidos" };
    }

    return { success: true, user: withoutPassword(foundUser) };
  },
};
