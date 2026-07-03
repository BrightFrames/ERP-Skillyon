import { useState, useEffect } from 'react';
import { getAppearance } from './settings';

export const translations: Record<string, Record<string, string>> = {
  Hindi: {
    "Dashboard": "डैशबोर्ड",
    "Schools": "विद्यालय",
    "Settings": "सेटिंग्स",
    "Sign out": "साइन आउट",
    "Appearance": "सजावट / प्रकटन",
    "Theme": "थीम",
    "Display Density": "प्रदर्शन घनत्व",
    "Language": "भाषा",
    "Save Changes": "बदलाव सहेजें",
    "Saved successfully!": "सफलतापूर्वक सहेजा गया!",
    "Light": "प्रकाश",
    "Dark": "अंधेरा",
    "System": "सिस्टम",
    "Compact": "संक्षिप्त",
    "Comfortable": "आरामदायक",
    "Spacious": "विशाल",
    "Profile": "प्रोफ़ाइल",
    "Security": "सुरक्षा",
    "Profile Information": "प्रोफ़ाइल जानकारी",
    "Security Settings": "सुरक्षा सेटिंग्स",
    "Current Password": "वर्तमान पासवर्ड",
    "New Password": "नया पासवर्ड",
    "Confirm New Password": "पासवर्ड की पुष्टि कीजिये",
    "Update Password": "पासवर्ड अपडेट करें"
  },
  Marathi: {
    "Dashboard": "डॅशबोर्ड",
    "Schools": "शाळा",
    "Settings": "सेटिंग्ज",
    "Sign out": "बाहेर पडा",
    "Appearance": "दिसणे / रूप",
    "Theme": "थीम",
    "Display Density": "प्रदर्शन घनता",
    "Language": "भाषा",
    "Save Changes": "बदल जतन करा",
    "Saved successfully!": "यशस्वीरित्या जतन केले!",
    "Light": "प्रकाश",
    "Dark": "गडद",
    "System": "सिस्टम",
    "Compact": "संक्षिप्त",
    "Comfortable": "आरामदायक",
    "Spacious": "प्रशस्त",
    "Profile": "प्रोफाईल",
    "Security": "सुरक्षा",
    "Profile Information": "प्रोफाईल माहिती",
    "Security Settings": "सुरक्षा सेटिंग्स",
    "Current Password": "चालू पासवर्ड",
    "New Password": "नवीन पासवर्ड",
    "Confirm New Password": "नवीन पासवर्डची खात्री करा",
    "Update Password": "पासवर्ड अपडेट करा"
  },
  Gujarati: {
    "Dashboard": "ડેશબોર્ડ",
    "Schools": "શાળાઓ",
    "Settings": "સેટિંગ્સ",
    "Sign out": "સાઇન આઉટ",
    "Appearance": "દેખાવ",
    "Theme": "થીમ",
    "Display Density": "ડિસ્પ્લે ઘનતા",
    "Language": "ભાષા",
    "Save Changes": "ફેરફારો સાચવો",
    "Saved successfully!": "સફળતાપૂર્વક સાચવવામાં આવ્યું!",
    "Light": "પ્રકાશ",
    "Dark": "અંધકાર",
    "System": "સિસ્ટમ",
    "Compact": "કૉમ્પેક્ટ",
    "Comfortable": "આરાమદાયક",
    "Spacious": "વિશાળ",
    "Profile": "પ્રોફાઇલ",
    "Security": "સુરક્ષા",
    "Profile Information": "પ્રોફાઇલ માહિતી",
    "Security Settings": "સુરક્ષા સેટિંગ્સ",
    "Current Password": "વર્તમાન પાસવર્ડ",
    "New Password": "નવો પાસવર્ડ",
    "Confirm New Password": "નવા પાસવર્ડની પુષ્ટિ કરો",
    "Update Password": "પાસવર્ડ અપડેટ કરો"
  },
  Tamil: {
    "Dashboard": "டாஷ்போர்டு",
    "Schools": "பள்ளிகள்",
    "Settings": "அமைப்புகள்",
    "Sign out": "வெளியேறு",
    "Appearance": "தோற்றம்",
    "Theme": "தீம்",
    "Display Density": "காட்சி அடர்த்தி",
    "Language": "மொழி",
    "Save Changes": "மாற்றங்களைச் சேமி",
    "Saved successfully!": "வெற்றிகரமாக சேமிக்கப்பட்டது!",
    "Light": "ஒளி",
    "Dark": "இருள்",
    "System": "கணினி",
    "Compact": "சிறிய",
    "Comfortable": "வசதியான",
    "Spacious": "பரந்த",
    "Profile": "சுயவிவரம்",
    "Security": "பாதுகாப்பு",
    "Profile Information": "சுயவிவர தகவல்",
    "Security Settings": "பாதுகாப்பு அமைப்புகள்",
    "Current Password": "தற்போதைய கடவுச்சொல்",
    "New Password": "புதிய கடவுச்சொல்",
    "Confirm New Password": "புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்",
    "Update Password": "கடவுச்சொல்லைப் புதுப்பிக்கவும்"
  },
  Telugu: {
    "Dashboard": "డాష్‌బోర్డ్",
    "Schools": "పాఠశాలలు",
    "Settings": "సెట్టింగులు",
    "Sign out": "సైన్ అవుట్",
    "Appearance": "రూపం",
    "Theme": "థీమ్",
    "Display Density": "ప్రదర్శన సాంద్రత",
    "Language": "భాష",
    "Save Changes": "మార్పులను సేవ్ చేయి",
    "Saved successfully!": "విజయవంతంగా సేవ్ చేయబడింది!",
    "Light": "కాంతి",
    "Dark": "చీకటి",
    "System": "సిస్టమ్",
    "Compact": "సరిపోవు",
    "Comfortable": "సౌకర్యవంతమైన",
    "Spacious": "విశాలమైన",
    "Profile": "ప్రొఫైల్",
    "Security": "భద్రత",
    "Profile Information": "ప్రొఫైల్ సమాచారం",
    "Security Settings": "భద్రతా సెట్టింగులు",
    "Current Password": "ప్రస్తుత పాస్‌వర్డ్",
    "New Password": "కొత్త పాస్‌వర్డ్",
    "Confirm New Password": "కొత్త పాస్‌వర్డ్‌ను నిర్ధారించండి",
    "Update Password": "పాస్‌వర్డ్‌ను అప్‌డేట్ చేయి"
  }
};

export function getLanguage() {
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

export function t(key: string, lang: string) {
  if (lang === 'English') return key;
  return translations[lang]?.[key] || key;
}
