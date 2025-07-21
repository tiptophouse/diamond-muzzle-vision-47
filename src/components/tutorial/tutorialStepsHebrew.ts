export const tutorialStepsHebrew = [
  {
    id: 'welcome',
    title: {
      he: 'ברוכים הבאים למערכת ניהול היהלומים!',
      en: 'Welcome to Diamond Management System!'
    },
    content: {
      he: 'אנחנו נלמד אותך איך להשתמש במערכת שלב אחר שלב. המערכת מאפשרת לך לנהל מלאי יהלומים, לסרוק תעודות, ולהגיע ללקוחות חדשים.',
      en: 'We will teach you how to use the system step by step. The system allows you to manage diamond inventory, scan certificates, and reach new customers.'
    },
    requireClick: false
  },
  {
    id: 'lets-upload',
    title: {
      he: 'בואו נתחיל - העלאת תעודה!',
      en: 'Let\'s Start - Upload Certificate!'
    },
    content: {
      he: 'השלב הראשון הוא להעלות תעודות יהלומים. המערכת תקרא אוטומטיטי את הפרטים מהתעודה ותוסיף את היהלום למלאי שלך.',
      en: 'The first step is to upload diamond certificates. The system will automatically read the details from the certificate and add the diamond to your inventory.'
    },
    navigationTarget: '/upload',
    requireClick: false
  },
  {
    id: 'see-inventory',
    title: {
      he: 'ניהול המלאי החכם שלך',
      en: 'Your Smart Inventory Management'
    },
    content: {
      he: 'כאן תוכל לראות את כל היהלומים שלך, לערוך פרטים, לחפש ולמיין. כל יהלום יכול להיות גלוי בחנות או פרטי.',
      en: 'Here you can see all your diamonds, edit details, search and sort. Each diamond can be visible in the store or private.'
    },
    navigationTarget: '/inventory',
    requireClick: false
  },
  {
    id: 'visit-store',
    title: {
      he: 'החנות הווירטואלית שלך',
      en: 'Your Virtual Store'
    },
    content: {
      he: 'זו החזית הציבורית של העסק שלך! לקוחות יכולים לראות את היהלומים שלך, לסנן ולפנות אליך ישירות דרך טלגרם.',
      en: 'This is your business\'s public front! Customers can see your diamonds, filter and contact you directly through Telegram.'
    },
    navigationTarget: '/store',
    requireClick: false
  },
  {
    id: 'tutorial-complete',
    title: {
      he: 'מזל טוב! סיימת את ההדרכה',
      en: 'Congratulations! You completed the tutorial'
    },
    content: {
      he: 'עכשיו אתה מוכן להתחיל! תוכל להעלות יהלומים, לנהל מלאי ולמכור ללקוחות ברחבי העולם. בהצלחה!',
      en: 'Now you\'re ready to start! You can upload diamonds, manage inventory and sell to customers worldwide. Good luck!'
    },
    requireClick: false
  }
];

export const generateTutorialUrl = (telegramId: number, lang: string = 'he') => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/?tutorial=start&lang=${lang}&onboarding=true&user_id=${telegramId}`;
};