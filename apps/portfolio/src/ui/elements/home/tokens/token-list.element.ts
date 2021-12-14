import { homeTokenActions } from './token-actions';

export const tokenList = {
  view: 'datatable',
  title: 'Portfolio',
  items: '$.tokens',
  options: {
    pagination: false,
    defaultSortFieldId: 'value',
    defaultSortAsc: false,
    filterable: false,
  },
  columns: [
    {
      id: 'asset',
      value: '$.name',
      filterable: true,
      sortable: true,
      cell: [
        {
          view: 'tile',
          left: [
            {
              view: 'image',
              src: '$.logo',
              size: 28,
            },
          ],
          title: '$.name',
          subtitle: '$.price.display',
        },
      ],
    },
    {
      id: 'value',
      value: '$.balanceFiat.value',
      filterable: true,
      sortable: true,
      right: true,
      cell: [
        {
          view: 'tile',
          title: [
            {
              view: 'tile',
              title: '$.balanceFiat.display',
              right: [
                {
                  view: 'image',
                  src: '$.chain.logo',
                  size: 12,
                  tooltip: '$.chain.name',
                },
              ],
            },
          ],
          subtitle: '$.balance.display',
          right: true,
        },
      ],
    },
    {
      id: 'actions',
      compact: true,
      name: '',
      width: '22px',
      actions: homeTokenActions,
    },
  ],
};