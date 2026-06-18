import { mockUsers } from "../../mocks/mockData";

const withoutPassword = (user) => {
  const { password, ...safeUser } = user;
  void password;
  return safeUser;
};

export const authService = {
  login: (username, password) => {
    const foundUser = mockUsers.find(
      (user) => user.username === username && user.password === password,
    );

    if (!foundUser) {
      return { success: false, message: "Usuário ou senha inválidos" };
    }

    return { success: true, user: withoutPassword(foundUser) };
  },
};
