import api from "@/infrastructure/http/api";

export interface IBaseRepository<T> {
  findAll(): Promise<T[]>;
  findOne(id: string): Promise<T>;
}

/**
 * Cria um repositório base com findAll e findOne para um endpoint REST.
 * Elimina o boilerplate repetido em cada serviço CRUD.
 */
export function createBaseRepository<T>(basePath: string): IBaseRepository<T> {
  return {
    async findAll(): Promise<T[]> {
      const { data } = await api.get<T[]>(basePath);
      return data;
    },

    async findOne(id: string): Promise<T> {
      const { data } = await api.get<T>(`${basePath}/${id}`);
      return data;
    },
  };
}
