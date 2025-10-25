import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Dados da página atual' })
  data!: T[];

  @ApiProperty({ description: 'Número total de registros' })
  total!: number;

  @ApiProperty({ description: 'Página atual' })
  page!: number;

  @ApiProperty({ description: 'Tamanho da página' })
  pageSize!: number;

  @ApiProperty({ description: 'Total de páginas' })
  totalPages!: number;

  @ApiProperty({ description: 'Se há próxima página' })
  hasNextPage!: boolean;

  @ApiProperty({ description: 'Se há página anterior' })
  hasPreviousPage!: boolean;

  constructor(
    data: T[],
    total: number,
    page: number,
    pageSize: number,
  ) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
    this.totalPages = Math.ceil(total / pageSize);
    this.hasNextPage = page < this.totalPages;
    this.hasPreviousPage = page > 1;
  }
}