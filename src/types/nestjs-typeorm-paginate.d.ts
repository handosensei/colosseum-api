declare module 'nestjs-typeorm-paginate' {
  import { SelectQueryBuilder, Repository } from 'typeorm';

  export interface PaginationMeta {
    itemCount: number;
    totalItems?: number;
    itemsPerPage: number;
    totalPages?: number;
    currentPage: number;
  }

  export interface Pagination<PaginationObject> {
    items: PaginationObject[];
    meta: PaginationMeta;
  }

  export interface IPaginationOptions {
    page: number;
    limit: number;
    route?: string;
  }

  export declare function paginate<T>(
    repositoryOrQueryBuilder: Repository<T> | SelectQueryBuilder<T>,
    options: IPaginationOptions,
  ): Promise<Pagination<T>>;
}
