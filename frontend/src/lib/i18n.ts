import { useState, useEffect } from 'react';
import { getAppearance } from './settings';

export const translations: Record<string, Record<string, string>> = {
  Hindi: {
    "Dashboard": "डैशबोर्ड",
    "Students": "छात्र",
    "Academic": "शैक्षणिक",
    "Staff": "कर्मचारी",
    "Messages": "संदेश",
    "Fees": "फीस",
    "Reports": "रिपोर्ट",
    "Settings": "सेटिंग्स",
    "Support Center": "सहायता केंद्र",
    "Sign Out": "साइन आउट",
    "Search students, classes, or reports...": "छात्रों, कक्षाओं या रिपोर्टों को खोजें...",
    "Check In": "चेक इन",
    "Add New Student": "नया छात्र जोड़ें",
    "Save Changes": "बदलाव सहेजें",
    "Cancel": "रद्द करें",
    "Next": "अगला",
    "Previous": "पिछला",
    "Filter": "फ़िल्टर",
    "Appearance": "सजावट / प्रकटन",
    "Theme": "थीम",
    "Display Density": "प्रदर्शन घनत्व",
    "Language": "भाषा",
    "Saved successfully!": "सफलतापूर्वक सहेजा गया!",
    "Profile": "प्रोफ़ाइल",
    "Security": "सुरक्षा",
    "Notifications": "सूचनाएं",
    "System": "सिस्टम",
    "Manage your account, preferences, and system configuration.": "अपने खाते, प्राथमिकताओं और सिस्टम कॉन्फ़िगरेशन को प्रबंधित करें।"
  },
  Marathi: {
    "Dashboard": "डॅशबोर्ड",
    "Students": "विद्यार्थी",
    "Academic": "शैक्षणिक",
    "Staff": "कर्मचारी",
    "Messages": "संदेश",
    "Fees": "शुल्क / फी",
    "Reports": "अहवाल",
    "Settings": "सेटिंग्ज",
    "Support Center": "मदत केंद्र",
    "Sign Out": "बाहेर पडा",
    "Search students, classes, or reports...": "विद्यार्थी, वर्ग किंवा अहवाल शोधा...",
    "Check In": "चेक इन",
    "Add New Student": "नवीन विद्यार्थी जोडा",
    "Save Changes": "बदल जतन करा",
    "Cancel": "रद्द करा",
    "Next": "पुढील",
    "Previous": "मागील",
    "Filter": "फिल्टर",
    "Appearance": "दिसणे / रूप",
    "Theme": "थीम",
    "Display Density": "डिस्प्ले घनता",
    "Language": "भाषा",
    "Saved successfully!": "यशस्वीरित्या जतन केले!",
    "Profile": "प्रोफाईल",
    "Security": "सुरक्षा",
    "Notifications": "सूचना",
    "System": "सिस्टम",
    "Manage your account, preferences, and system configuration.": "तुमचे खाते, प्राधान्ये आणि सिस्टम कॉन्फिगरेशन व्यवस्थापित करा।"
  },
  Gujarati: {
    "Dashboard": "ડેશબોર્ડ",
    "Students": "વિદ્યાર્થીઓ",
    "Academic": "શૈક્ષણિક",
    "Staff": "સ્ટાફ",
    "Messages": "સંદેશાઓ",
    "Fees": "ફી",
    "Reports": "અહેવાलो",
    "Settings": "સેટિંગ્સ",
    "Support Center": "સહાય કેન્દ્ર",
    "Sign Out": "સાઇન આઉટ",
    "Search students, classes, or reports...": "વિદ્યાર્થીઓ, વર્ગો અથવા અહેવાલો શોધો...",
    "Check In": "ચેક ઇન",
    "Add New Student": "નવો વિદ્યાર્થી ઉમેરો",
    "Save Changes": "ફેરફારો સાચવો",
    "Cancel": "રદ કરો",
    "Next": "આગળ",
    "Previous": "પાછળ",
    "Filter": "ફિલ્ટર",
    "Appearance": "દેખાવ",
    "Theme": "થીમ",
    "Display Density": "ડિસ્પ્લે ઘનતા",
    "Language": "ભાષા",
    "Saved successfully!": "સફળતાપૂર્વક સાચવવામાં આવ્યું!",
    "Profile": "પ્રોફાઇલ",
    "Security": "સુરક્ષા",
    "Notifications": "સૂચનાઓ",
    "System": "સિસ્ટમ",
    "Manage your account, preferences, and system configuration.": "તમારા એકાઉન્ટ, પસંદગીઓ અને સિસ્ટમ ગોઠવણીનું સંચાલન કરો."
  },
  Tamil: {
    "Dashboard": "டாஷ்போர்டு",
    "Students": "மாணவர்கள்",
    "Academic": "கல்வி",
    "Staff": "ஊழியர்கள்",
    "Messages": "செய்திகள்",
    "Fees": "கட்டணம்",
    "Reports": "அறிக்கைகள்",
    "Settings": "அமைப்புகள்",
    "Support Center": "உதவி மையம்",
    "Sign Out": "வெளியேறு",
    "Search students, classes, or reports...": "மாணவர்கள், வகுப்புகள் அல்லது அறிக்கைகளைத் தேடுக...",
    "Check In": "உள்நுழைவு",
    "Add New Student": "புதிய மாணவரைச் சேர்",
    "Save Changes": "மாற்றங்களைச் சேமி",
    "Cancel": "ரத்துசெய்",
    "Next": "அடுத்து",
    "Previous": "முந்தைய",
    "Filter": "வடிகட்டி",
    "Appearance": "தோற்றம்",
    "Theme": "தீம்",
    "Display Density": "காட்சி அடர்த்தி",
    "Language": "மொழி",
    "Saved successfully!": "வெற்றிகரமாக சேமிக்கப்பட்டது!",
    "Profile": "சுயவிவரம்",
    "Security": "பாதுகாப்பு",
    "Notifications": "அறிவிப்புகள்",
    "System": "கணினி",
    "Manage your account, preferences, and system configuration.": "உங்கள் கணக்கு, விருப்பத்தேர்வுகள் மற்றும் கணினி கட்டமைப்பை నిர்வகிக்கவும்."
  },
  Telugu: {
    "Dashboard": "డాష్‌బోర్డ్",
    "Students": "విద్యార్థులు",
    "Academic": "విద్యా విషయాలు",
    "Staff": "సిబ్బంది",
    "Messages": "సందేశాలు",
    "Fees": "ఫీజులు",
    "Reports": "నివేదికలు",
    "Settings": "సెట్టింగులు",
    "Support Center": "సహాయ కేంద్రం",
    "Sign Out": "సైన్ అవుట్",
    "Search students, classes, or reports...": "విద్యార్థులు, తరగతులు లేదా నివేదికలను శోధించండి...",
    "Check In": "చెక్ ఇన్",
    "Add New Student": "కొత్త విద్యార్థిని చేర్చు",
    "Save Changes": "మార్పులను సేవ్ చేయి",
    "Cancel": "రద్దు చేయి",
    "Next": "తరువాత",
    "Previous": "మునుపటి",
    "Filter": "ఫిల్టర్",
    "Appearance": "రూపం",
    "Theme": "థీమ్",
    "Display Density": "ప్రదర్శన సాంద్రత",
    "Language": "భాష",
    "Saved successfully!": "విజయవంతంగా సేవ్ చేయబడింది!",
    "Profile": "ప్రొఫైల్",
    "Security": "భద్రత",
    "Notifications": "నోటిఫికేషన్లు",
    "System": "సిస్టమ్",
    "Manage your account, preferences, and system configuration.": "మీ ఖాతా, ప్రాధాన్యతలు మరియు సిస్టమ్ కాన్ఫిగరేషన్‌ను నిర్వహించండి."
  }
};

export function getLanguage(): string {
  return getAppearance().language || 'English';
}

export function useLanguage() {
  const [lang, setLang] = useState(getLanguage());

  useEffect(() => {
    const handleUpdate = () => {
      setLang(getLanguage());
    };
    window.addEventListener('appearance-changed', handleUpdate);
    return () => window.removeEventListener('appearance-changed', handleUpdate);
  }, []);

  return lang;
}

export function t(key: string, lang: string): string {
  if (lang === 'English') return key;
  return translations[lang]?.[key] || key;
}
