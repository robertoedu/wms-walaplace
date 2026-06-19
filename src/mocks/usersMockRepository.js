import { mockUsers } from "./mockData.js";
import { createMockStorage } from "./mockStorage.js";
import { modulesService } from "../shared/services/modulesService.js";

const STORAGE_KEY = "wms_users_database_v1";
const STORAGE_VERSION = 1;

const getAdminPermissions = () => modulesService.listModules().map((module) => module.id);

const normalizeUser = (user) => ({
  ...user,
  permissions: user.role === "admin" ? getAdminPermissions() : [...(user.permissions || [])],
});

const storage = createMockStorage({
  key: STORAGE_KEY,
  version: STORAGE_VERSION,
  eventName: "wms-users-change",
  createInitial: () => ({
    version: STORAGE_VERSION,
    users: mockUsers.map(normalizeUser),
  }),
});

const { clone, write, reset } = storage;

const read = () => {
  const database = storage.read();
  const normalizedUsers = database.users.map(normalizeUser);
  const changed = JSON.stringify(database.users) !== JSON.stringify(normalizedUsers);

  if (changed) {
    database.users = normalizedUsers;
    write(database);
  }

  return database;
};

export const usersMockRepository = {
  listUsers() {
    return clone(read().users);
  },

  findByCredentials(username, password) {
    return clone(read().users.find(
      (user) => user.username === username && user.password === password,
    ) || null);
  },

  saveUser(userData) {
    const database = read();
    const current = userData.id
      ? database.users.find((user) => user.id === userData.id)
      : null;
    const username = String(userData.username || "").trim();
    const email = String(userData.email || "").trim();

    if (!username || !email || !String(userData.name || "").trim()) {
      throw new Error("Preencha nome, usuario e email.");
    }

    const duplicatedUsername = database.users.some(
      (user) => user.id !== current?.id && user.username.toLowerCase() === username.toLowerCase(),
    );
    if (duplicatedUsername) throw new Error("Usuario ja cadastrado.");

    const nextUser = normalizeUser({
      ...current,
      ...userData,
      id: current?.id || Math.max(0, ...database.users.map((user) => Number(user.id) || 0)) + 1,
      username,
      email,
      permissions: userData.permissions || current?.permissions || [],
      createdAt: current?.createdAt || new Date().toISOString(),
    });

    if (current) database.users[database.users.indexOf(current)] = nextUser;
    else database.users.push(nextUser);

    write(database);
    return clone(nextUser);
  },

  reset() {
    return reset();
  },
};
