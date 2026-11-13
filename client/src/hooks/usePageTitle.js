import { useEffect } from 'react';

const SITE = 'House of Homegrown';

const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE}` : `${SITE} - Authentic Indian Products`;
  }, [title]);
};

export default usePageTitle;
