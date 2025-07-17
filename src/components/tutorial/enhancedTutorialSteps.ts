export const enhancedTutorialSteps = [
  {
    target: '[data-tutorial="welcome"]',
    content: {
      title: 'ברוכים הבאים למערכת ניהול היהלומים!',
      description: 'אנחנו נלמד אותך איך להשתמש במערכת שלב אחר שלב. בואו נתחיל!',
      position: 'center' as const,
    },
    action: 'highlight',
    step: 1
  },
  {
    target: '[data-tutorial="scan-certificate"]',
    content: {
      title: 'סריקת תעודה - השלב הראשון',
      description: 'כאן תוכל לסרוק תעודות יהלומים בקלות. לחץ על הכפתור כדי להתחיל לסרוק תעודה חדשה.',
      position: 'bottom' as const,
    },
    action: 'click',
    step: 2,
    navigation: '/upload-single-stone'
  },
  {
    target: '[data-tutorial="start-scanning"]',
    content: {
      title: 'התחל סריקה',
      description: 'לחץ כאן כדי להתחיל את תהליך סריקת התעודה. המערכת תקרא את הפרטים מהתעודה אוטומטית.',
      position: 'top' as const,
    },
    action: 'highlight',
    step: 3
  },
  {
    target: '[data-tutorial="upload-image"]',
    content: {
      title: 'העלאת תמונה',
      description: 'כאן תוכל להעלות תמונה של התעודה או של היהלום עצמו.',
      position: 'top' as const,
    },
    action: 'highlight',
    step: 4
  },
  {
    target: '[data-tutorial="diamond-form"]',
    content: {
      title: 'מילוי פרטי היהלום',
      description: 'לאחר הסריקה, תוכל לערוך ולהשלים את פרטי היהלום כאן.',
      position: 'right' as const,
    },
    action: 'highlight',
    step: 5
  },
  {
    target: '[data-tutorial="submit-diamond"]',
    content: {
      title: 'שמירת היהלום',
      description: 'לחץ כאן כדי לשמור את היהלום במערכת שלך.',
      position: 'top' as const,
    },
    action: 'click',
    step: 6
  },
  {
    target: '[data-tutorial="view-store"]',
    content: {
      title: 'צפייה בחנות',
      description: 'כאן תוכל לראות את היהלום שהעלית בחנות הווירטואלית שלך.',
      position: 'center' as const,
    },
    action: 'navigate',
    navigation: '/store',
    step: 7
  },
  {
    target: '[data-tutorial="dashboard-navigation"]',
    content: {
      title: 'ניווט ללוח הבקרה',
      description: 'בואו נעבור ללוח הבקרה כדי לראות את סטטיסטיקת היהלומים שלך.',
      position: 'top' as const,
    },
    action: 'navigate',
    navigation: '/dashboard',
    step: 8
  },
  {
    target: '[data-tutorial="inventory-count"]',
    content: {
      title: 'מלאי היהלומים שלך',
      description: 'כאן תראה שיש לך יהלום אחד במלאי לאחר ההעלאה.',
      position: 'bottom' as const,
    },
    action: 'highlight',
    step: 9
  },
  {
    target: '[data-tutorial="inventory-navigation"]',
    content: {
      title: 'מעבר למלאי',
      description: 'בואו נעבור לעמוד המלאי כדי ללמוד איך לנהל את היהלומים שלך.',
      position: 'top' as const,
    },
    action: 'navigate',
    navigation: '/inventory',
    step: 10
  },
  {
    target: '[data-tutorial="add-diamond"]',
    content: {
      title: 'הוספת יהלום חדש',
      description: 'כאן תוכל להוסיף יהלומים חדשים למלאי שלך.',
      position: 'top' as const,
    },
    action: 'highlight',
    step: 11
  },
  {
    target: '[data-tutorial="delete-diamond"]',
    content: {
      title: 'מחיקת יהלום',
      description: 'כאן תוכל למחוק יהלומים מהמלאי שלך. שים לב - פעולה זו בלתי הפיכה.',
      position: 'left' as const,
    },
    action: 'highlight',
    step: 12
  },
  {
    target: '[data-tutorial="tutorial-complete"]',
    content: {
      title: 'סיימת את ההדרכה!',
      description: 'מעולה! עכשיו אתה יודע איך להשתמש במערכת. תוכל להתחיל להעלות יהלומים ולנהל את המלאי שלך.',
      position: 'center' as const,
    },
    action: 'complete',
    step: 13
  }
];

export const generateTutorialUrl = (telegramId: number, lang: string = 'he') => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/?tutorial=start&lang=${lang}&onboarding=true&user_id=${telegramId}`;
};