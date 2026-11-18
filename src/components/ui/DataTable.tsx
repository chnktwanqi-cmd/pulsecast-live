import { useMemo, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRow,
  empty = 'Nothing matches these filters.',
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRow?: (row: T) => void;
  empty?: string;
}) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((item) => item.key === sort.key);
    if (!column?.sortValue) return rows;
    return [...rows].sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [columns, rows, sort]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            {columns.map((column) => {
              const active = sort?.key === column.key;
              return (
                <th key={column.key} className={cn('border-b border-slate-100 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400', column.className)}>
                  {column.sortValue ? (
                    <button
                      className="inline-flex items-center gap-1"
                      onClick={() =>
                        setSort((current) =>
                          current?.key === column.key
                            ? { key: column.key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
                            : { key: column.key, dir: 'asc' },
                        )
                      }
                    >
                      {column.header}
                      <span className="text-[10px]">{active ? (sort?.dir === 'asc' ? '↑' : '↓') : '↕'}</span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-10 text-center text-sm text-slate-400">
                {empty}
              </td>
            </tr>
          ) : (
            sorted.map((row) => (
              <tr
                key={rowKey(row)}
                className={cn('border-b border-slate-50', onRow && 'cursor-pointer hover:bg-pink-50/40')}
                onClick={onRow ? () => onRow(row) : undefined}
              >
                {columns.map((column) => (
                  <td key={column.key} className={cn('border-b border-slate-100/80 px-3 py-3 text-slate-700', column.className)}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
