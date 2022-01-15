export const FICTION_STATUS = {
  DRAFT: 0,
  PUBLISH: 30,
  COMPLETED : 50,
  SUSPEND : 60,
  SUSPEND_BY_ADMIN : 70,
  DROP : 80,
  DELETE: 90,
};

export const statusDescriptionMap = {
  // mock data
  price_option: [
    {
      code: FICTION_STATUS.DRAFT,
      displayText: 'common:fiction-status.fiction-draft',
    },
    {
      code: FICTION_STATUS.PUBLISH,
      displayText: 'common:fiction-status.fiction-publish',
    },
    {
      code: FICTION_STATUS.COMPLETED,
      displayText: 'common:fiction-status.fiction-completed',
    },
    {
      code: FICTION_STATUS.SUSPEND,
      displayText: 'common:fiction-status.fiction-on-hold',
    },
    {
      code: FICTION_STATUS.DROP,
      displayText: 'common:fiction-status.fiction-drop',
    },
    {
      code: FICTION_STATUS.DELETE,
      displayText: 'common:fiction-status.fiction-delete',
    },
  ],
};

export const getFictionDescription = inputStatus => {
  let returnDescription = '';
  statusDescriptionMap.price_option.map(priceItem => {
    if (priceItem.code === inputStatus) {
      returnDescription = priceItem.displayText;
    }
  });
  return returnDescription;
};
